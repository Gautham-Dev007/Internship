import cv2
import base64
import firebase_admin
from firebase_admin import credentials, db
import time
import datetime
import threading
import sys
import os

# ==== FIREBASE CONFIG ====
#ADD the firbase.json

cred = credentials.Certificate("faceuploader-3347e-firebase-adminsdk-fbsvc-9da7e105ad.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://faceuploader-3347e-default-rtdb.firebaseio.com/"
})

ref_control = db.reference("control/start_recognition")
ref_status  = db.reference("status")
ref_faces   = db.reference("faces")

# Haar cascade (face detector)
cascPath = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
faceCascade = cv2.CascadeClassifier(cascPath)

# ==== GLOBALS ====
running = False
cap = None   # Camera will be opened/closed dynamically

# ==== LOGO CONFIG ====
LOGO_PATH = "logo.png"   # 👈 put your company logo here
logo_b64 = None
if os.path.exists(LOGO_PATH):
    with open(LOGO_PATH, "rb") as f:
        logo_b64 = base64.b64encode(f.read()).decode("utf-8")


def set_status(is_active, error=""):
    """Update Firebase status node (with branding)."""
    ref_status.set({
        "is_recognition_active": is_active,
        "last_active": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "error": error,
        "branding": {
            "made_by": "Gautham Seetharaman",
            "company": "MicroLOGIX",
            "text": "Made by Gautham Seetharaman for MicroLOGIX",
            "logo_base64": logo_b64  # Logo as Base64, so web/app can show it
        }
    })


def open_camera():
    global cap
    if cap is None or not cap.isOpened():
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("❌ Cannot open camera")
            set_status(False, "Camera failed to open")
            return False
        print("📷 Camera started")
    return True


def close_camera():
    global cap
    if cap is not None and cap.isOpened():
        cap.release()
        print("📴 Camera released")
    cap = None


def overlay_logo(frame):
    """Overlay watermark text only (logo sent via Firebase)."""
    cv2.putText(frame,
                "Made by Gautham Seetharaman for MicroLOGIX",
                (10, frame.shape[0] - 20),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2,
                cv2.LINE_AA)
    return frame


def watch_control():
    """ Continuously watches Firebase control flag. """
    global running
    last_val = None
    while True:
        try:
            val = ref_control.get()
            if val != last_val:
                print(f"[CONTROL] start_recognition = {val}")
                last_val = val
            running = bool(val)

            if running:
                open_camera()
            else:
                close_camera()
                set_status(False)

        except Exception as e:
            print("Control check error:", e)
        time.sleep(2)


def capture_loop():
    global cap
    while True:
        if not running:
            time.sleep(1)
            continue

        if not (cap and cap.isOpened()):
            time.sleep(1)
            continue

        ret, frame = cap.read()
        if not ret:
            set_status(False, "Camera read failed")
            time.sleep(1)
            continue

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = faceCascade.detectMultiScale(
            gray,
            scaleFactor=1.2,
            minNeighbors=7,
            minSize=(80, 80)
        )

        valid_faces = []
        for (x, y, w, h) in faces:
            aspect_ratio = w / float(h)
            if 0.75 < aspect_ratio < 1.3:
                valid_faces.append((x, y, w, h))

        for (x, y, w, h) in valid_faces:
            face_img = frame[y:y+h, x:x+w]
            _, buf = cv2.imencode(".jpg", face_img)
            jpg_as_text = base64.b64encode(buf).decode("utf-8")

            ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            ref_faces.push({
                "timestamp": ts,
                "image_base64": jpg_as_text
            })
            print(f"[UPLOAD] Face captured at {ts}")
            time.sleep(2)

        # Overlay watermark text (logo is already in Firebase)
        preview = overlay_logo(frame.copy())
        cv2.imshow("Face Recognition - MicroLOGIX", preview)

        if valid_faces:
            set_status(True)
        else:
            set_status(False)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

        time.sleep(0.5)

    close_camera()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    try:
        threading.Thread(target=watch_control, daemon=True).start()
        capture_loop()
    except KeyboardInterrupt:
        print("Stopping...")
    finally:
        close_camera()
        set_status(False, "App stopped")
        cv2.destroyAllWindows()
