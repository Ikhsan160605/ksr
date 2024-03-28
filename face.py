import cv2
import face_recognition
import numpy as np

# Load foto dan ekstrak fitur wajah
known_image = face_recognition.load_image_file("image.jpeg")
known_face_encoding = face_recognition.face_encodings(known_image)[0]

# Load pre-trained face detection classifier
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Fungsi untuk mendeteksi wajah dan membandingkan dengan foto yang disimpan
def detect_and_compare_faces(frame):
    # Konversi frame ke grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    # Deteksi wajah dalam frame
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    
    # Loop melalui wajah yang terdeteksi
    for (x, y, w, h) in faces:
        # Ambil area wajah dari frame
        face_image = frame[y:y+h, x:x+w]
        
        # Ekstrak fitur wajah dari frame dan pastikan encodingnya merupakan numpy array
        face_encoding = face_recognition.face_encodings(face_image)
        if len(face_encoding) > 0:
            face_encoding = np.array(face_encoding[0])
        
        # Bandingkan fitur wajah dengan fitur wajah dari foto yang disimpan
        matches = face_recognition.compare_faces([known_face_encoding], [face_encoding])  # Pastikan face_encoding berupa list of numpy arrays
        
        # Jika ada wajah yang cocok, tampilkan nama
        if matches[0]:
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(frame, "Nama Wajah Cocok", (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2, cv2.LINE_AA)
    
    return frame


# Main function untuk membuka kamera dan mendeteksi serta membandingkan wajah
def main():
    # Buka kamera
    cap = cv2.VideoCapture(0)
    
    # Periksa apakah kamera berhasil dibuka
    if not cap.isOpened():
        print("Error: Could not open camera.")
        return
    
    # Loop untuk menangkap frame dari kamera
    while True:
        # Tangkap frame per frame
        ret, frame = cap.read()
        if not ret:
            print("Error: Could not read frame.")
            break
        
        # Deteksi dan bandingkan wajah dalam frame
        frame_with_faces = detect_and_compare_faces(frame)
        
        # Tampilkan frame dengan wajah yang terdeteksi
        cv2.imshow('Face Detection', frame_with_faces)
        
        # Periksa tombol kunci untuk keluar
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    # Lepaskan kamera dan tutup semua jendela
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
