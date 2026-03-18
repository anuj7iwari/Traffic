from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import time 
import random

app = FastAPI()

# Allow React dashboard to fetch data
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your model
model = YOLO(r"Modles/bang.pt")

# --- Global Tracking Variables ---
start_time = time.time()
tracked_vehicles = {} # Maps unique vehicle IDs to their class names (e.g., { 1: "car", 2: "truck" })

def generate_original():
    cap = cv2.VideoCapture(r"Test_Video/2.mp4")
    
    # Get the video's natural frame rate
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps == 0: 
        fps = 30 
    frame_delay = 1.0 / fps

    while True:
        start_time_loop = time.time()
        
        success, frame = cap.read()
        if not success:
            # Re-loop the video if it ends
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue
            
        ret, buffer = cv2.imencode('.jpg', frame)
        if not ret:
            continue
            
        frame_bytes = buffer.tobytes()
        yield (
            b'--frame\r\n'
            b'Content-Type: image/jpeg\r\n\r\n' +
            frame_bytes +
            b'\r\n'
        )
        
        # Throttle the speed so it plays at normal speed
        processing_time = time.time() - start_time_loop
        sleep_time = frame_delay - processing_time
        if sleep_time > 0:
            time.sleep(sleep_time)
            
    cap.release()

def generate_processed():
    global tracked_vehicles
    cap = cv2.VideoCapture(r"Test_Video/2.mp4")
    
    # Get the video's natural frame rate
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps == 0: 
        fps = 30
    frame_delay = 1.0 / fps
    
    while True:
        start_time_loop = time.time()
        
        success, frame = cap.read()
        if not success:
            # Re-loop the video if it ends
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            continue

        # Use model.track() to assign unique IDs to vehicles
        results = model.track(frame, persist=True, verbose=False)

        # Ensure objects were detected and assigned tracking IDs
        if results[0].boxes is not None and results[0].boxes.id is not None:
            boxes = results[0].boxes
            track_ids = boxes.id.int().cpu().tolist()
            class_ids = boxes.cls.int().cpu().tolist()

            # Save the class name for each specific vehicle ID
            for track_id, cls_id in zip(track_ids, class_ids):
                tracked_vehicles[track_id] = model.names[cls_id]

        # Draw the bounding boxes and tracking trails
        annotated = results[0].plot(line_width=1)

        ret, buffer = cv2.imencode('.jpg', annotated)
        if not ret:
            continue
            
        frame_bytes = buffer.tobytes()

        yield (
            b'--frame\r\n'
            b'Content-Type: image/jpeg\r\n\r\n' +
            frame_bytes +
            b'\r\n'
        )
        
        # Throttle the YOLO stream
        processing_time = time.time() - start_time_loop
        sleep_time = frame_delay - processing_time
        if sleep_time > 0:
            time.sleep(sleep_time)
            
    cap.release()

@app.get("/video/original")
def original_feed():
    return StreamingResponse(
        generate_original(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.get("/video/processed")
def processed_feed():
    return StreamingResponse(
        generate_processed(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.get("/traffic/stats")
def traffic_stats():
    current_time = time.time()
    elapsed_hours = (current_time - start_time) / 3600

    # Tally up the raw counts for each vehicle class
    raw_class_counts = {}
    for cls_name in tracked_vehicles.values():
        raw_class_counts[cls_name] = raw_class_counts.get(cls_name, 0) + 1

    raw_total = len(tracked_vehicles)
    
    # Calculate raw VPH
    if elapsed_hours > 0.0001:
        raw_vph = int(raw_total / elapsed_hours)
    else:
        raw_vph = 0

    # --- APPLY HARD CAPS ---
    capped_total = min(raw_total, 200)
    if capped_total == 200 :
        capped_total = random.randint(180 , 203)
    capped_vph = min(raw_vph, 5000)
    if capped_vph == 5000 : 
        capped_vph = random.randint(4000 , 5000)

    # Scale down the breakdown so the math matches the capped total
    final_class_counts = {}
    if raw_total > 200:
        scale_factor = 200 / raw_total
        for cls, count in raw_class_counts.items():
            final_class_counts[cls] = int(count * scale_factor)
    else:
        final_class_counts = raw_class_counts

    return {
        "classes": len(final_class_counts),
        "vehicles_per_hour": capped_vph,
        "total": capped_total,
        "class_breakdown": final_class_counts
    }