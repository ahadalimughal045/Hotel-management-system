# app.py
from flask import Flask, render_template, request, redirect, url_for, session, jsonify, make_response # Import make_response
import firebase_admin
from firebase_admin import credentials, auth, firestore
from google.cloud.firestore import DELETE_FIELD
from datetime import datetime, timedelta # Import timedelta
import os
import requests
import random, string

FIREBASE_API_KEY = "AIzaSyDtkwPjBxYz3ncg1u1K4uBoTURyfgf7mCk" # User's Firebase Web API key

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.urandom(24) # Set a secret key for session management

# --- Firebase Admin SDK Initialization ---
# IMPORTANT: Replace 'path/to/your/serviceAccountKey.json' with the actual path to your Firebase service account key file.
# You can download this file from your Firebase Project Settings -> Service accounts.
# It's highly recommended to store this path as an environment variable in a production environment.
try:
    # Attempt to load from environment variable first
    service_account_path = os.environ.get('FIREBASE_SERVICE_ACCOUNT_KEY_PATH', 'serviceAccountKey.json')
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    print("Please ensure 'path/to/your/serviceAccountKey.json' is correct or FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable is set.")
    # Exit or handle the error appropriately if Firebase is critical for your app.

# --- Routes ---

@app.route('/')
def login_page():
    """Renders the login page."""
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    id_token = data.get('idToken')
    if not id_token:
        return jsonify({'redirect': None, 'message': 'Missing ID token.'}), 400
    try:
        # Verify the ID token
        decoded_token = auth.verify_id_token(id_token)
        uid = decoded_token['uid']
        role = decoded_token.get('role') or decoded_token.get('claims', {}).get('role')

        # Set Flask session variables (for server-side logic if needed)
        session['user_id'] = uid
        session['user_email'] = decoded_token.get('email')
        session['role'] = role

        # Create a session cookie for Firebase client-side authentication
        # Set session cookie to expire in 5 days (adjust as needed)
        expires_in = timedelta(days=5)
        session_cookie = auth.create_session_cookie(id_token, expires_in=expires_in)

        # Determine redirect URL based on role
        if role == 'admin':
            # Explicitly define endpoint name for clarity and robustness
            redirect_url = url_for('dashboard')
        elif role == 'user':
            redirect_url = url_for('user_dashboard')
        else:
            return jsonify({'redirect': None, 'message': 'Unauthorized role.'}), 403

        # Create a Flask response object with the redirect URL
        response = make_response(jsonify({'redirect': redirect_url}))

        # Set the Firebase session cookie in the response
        # Important: domain should be the domain your app is served from
        # For local development, you might need to adjust 'domain' or omit it.
        # Ensure secure=True for HTTPS in production, httponly=True for security.
        response.set_cookie(
            '__session', # This is the name Firebase JS SDK looks for
            session_cookie,
            max_age=expires_in.total_seconds(),
            httponly=True,
            secure=False, # Set to True for production with HTTPS
            domain=None # Set to your actual domain in production (e.g., 'yourdomain.com')
        )

        return response # Return the response with the cookie
    except Exception as e:
        print(f"Error during login: {e}")
        # Explicitly convert the exception object 'e' to a string to avoid TypeError
        return jsonify({'redirect': None, 'message': f'Invalid token or login error: {str(e)}'}), 401

@app.route('/forgot-password')
def forgot_password_page():
    """Renders the forgot password page."""
    return render_template('forgot-password.html')

@app.route('/reset-password', methods=['POST'])
def reset_password():
    """Handles password reset requests."""
    email = request.form.get('email')
    new_password = request.form.get('newPassword')
    old_password = request.form.get('oldPassword') # This is sent from the client-side prompt

    if not email or not new_password or not old_password:
        return jsonify({'success': False, 'message': 'All fields are required.'}), 400

    try:
        # In a real app, you would verify the old password on the client-side
        # by signing in the user and then updating the password.
        # Firebase Admin SDK doesn't directly verify old passwords for updatePassword.
        # It's typically done after a successful re-authentication on the client.
        # For this example, we'll just update the user's password directly using Admin SDK.
        # This is less secure if not combined with client-side re-authentication.

        user = auth.get_user_by_email(email)
        auth.update_user(user.uid, password=new_password)
        return jsonify({'success': True, 'message': 'Password changed successfully!'}), 200
    except auth.UserNotFoundError:
        return jsonify({'success': False, 'message': 'User not found.'}), 404
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/dashboard', endpoint='dashboard') # Added explicit endpoint name here
def dashboard():
    if session.get('role') != 'admin':
        return redirect(url_for('login_page'))
    return render_template('dashboard.html')

@app.route('/User_dashboard')
def user_dashboard():
    if session.get('role') != 'user':
        return redirect(url_for('login_page'))
    return render_template('User_dashboard.html')

@app.route('/logout')
def logout():
    """Logs out the user."""
    session.pop('user_id', None)
    session.pop('user_email', None)
    session.pop('role', None) # Clear the role from session as well
    
    # Create a response to delete the session cookie on the client side
    response = make_response(redirect(url_for('login_page')))
    response.delete_cookie('__session') # Delete the Firebase session cookie
    return response

@app.route('/staff-scheduler')
def staff_scheduler():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return render_template('staff-scheduler.html')

@app.route('/staff-availability')
def staff_availability():
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    return render_template('staff-availability.html')   

@app.route('/medical')
def medical():
    return render_template('medical.html')

@app.route('/food')
def food():
    return render_template('food.html')

@app.route('/room')
def room():
    return render_template('room.html')

@app.route('/profile')
def profile():
    if session.get('role') != 'user':
        return redirect(url_for('login_page'))
    return render_template('profile.html')

# --- Room Booking Routes ---

@app.route('/<room_type>.html')
def room_booking_page(room_type):
    """Renders the specific room booking page."""
    if 'user_id' not in session:
        return redirect(url_for('login_page'))
    
    # Ensure room_type is valid
    valid_room_types = ['premium', 'semi-premium', 'economy']
    if room_type not in valid_room_types:
        return redirect(url_for('dashboard')) # Or render a 404 page

    return render_template(f'{room_type}.html', room_type=room_type)

@app.route('/api/rooms/<room_type>', methods=['GET'])
def get_rooms(room_type):
    """API endpoint to get room data for a specific type."""
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401

    rooms_data = []
    try:
        # Fetch rooms from Firestore
        rooms_ref = db.collection('rooms').where('type', '==', room_type).stream()
        for doc in rooms_ref:
            room = doc.to_dict()
            room['id'] = doc.id # Include document ID as room ID
            # If password is stored, include it in the response
            if 'customer_password' in room:
                room['customer_password'] = room['customer_password']
            rooms_data.append(room)
        return jsonify({'success': True, 'rooms': rooms_data}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/book_room', methods=['POST'])
def book_room():
    """API endpoint to book a room and create a Firebase Auth user for the customer."""
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401

    import random, string
    data = request.get_json()
    room_id = data.get('roomId')
    room_type = data.get('roomType')
    customer_name = data.get('userName')
    customer_contact = data.get('userContact')
    customer_cnic = data.get('userCnic')

    if not all([room_id, room_type, customer_name, customer_contact, customer_cnic]):
        return jsonify({'success': False, 'message': 'Missing required fields.'}), 400

    try:
        room_ref = db.collection('rooms').document(room_id)
        room_doc = room_ref.get()

        if not room_doc.exists:
            return jsonify({'success': False, 'message': 'Room not found.'}), 404

        current_status = room_doc.to_dict().get('status')
        if current_status == 'Booked':
            return jsonify({'success': False, 'message': 'Room is already booked.'}), 409

        # Generate unique email and password for the user
        def generate_email(name, room_type, room_id):
            base = name.lower().replace(' ', '')
            return f"{base}.{room_type}.{room_id}@hotel.com"
        def generate_password(length=8):
            chars = string.ascii_letters + string.digits
            return ''.join(random.choice(chars) for _ in range(length))
        email = generate_email(customer_name, room_type, room_id)
        password = generate_password()

        # Create user in Firebase Auth
        try:
            user_record = auth.create_user(
                email=email,
                password=password,
                display_name=customer_name
            )
            firebase_uid = user_record.uid
            # Set custom claim 'role' to 'user' for this new user
            auth.set_custom_user_claims(firebase_uid, {'role': 'user'})
        except Exception as e:
            return jsonify({'success': False, 'message': f'Error creating Firebase user: {e}'}), 500

        # Update room booking info in Firestore, including password
        room_ref.update({
            'status': 'Booked',
            'booked_by': session['user_id'], # Admin user who booked it
            'customer_name': customer_name,
            'customer_contact': customer_contact,
            'customer_cnic': customer_cnic,
            'booking_time': datetime.now(),
            'customer_email': email,
            'customer_uid': firebase_uid,
            'customer_password': password
        })

        # Optionally, store user info in a users collection
        db.collection('users').document(firebase_uid).set({
            'name': customer_name,
            'email': email,
            'contact': customer_contact,
            'cnic': customer_cnic,
            'room_id': room_id,
            'room_type': room_type,
            'created_by': session['user_id'],
            'created_at': datetime.now(),
            'password': password
        })

        return jsonify({'success': True, 'message': 'Room booked and user created successfully!', 'email': email, 'password': password}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/cancel_booking', methods=['POST'])
def cancel_booking():
    """API endpoint to cancel a room booking."""
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401

    data = request.get_json()
    room_id = data.get('roomId')

    if not room_id:
        return jsonify({'success': False, 'message': 'Room ID is required.'}), 400

    try:
        room_ref = db.collection('rooms').document(room_id)
        room_doc = room_ref.get()

        if not room_doc.exists:
            return jsonify({'success': False, 'message': 'Room not found.'}), 404

        current_status = room_doc.to_dict().get('status')
        if current_status == 'Available':
            return jsonify({'success': False, 'message': 'Room is already available.'}), 409

        # Delete Firebase Auth user if exists
        customer_uid = room_doc.to_dict().get('customer_uid')
        if customer_uid:
            try:
                auth.delete_user(customer_uid)
            except Exception as e:
                # Log error but continue
                print(f'Error deleting Firebase user: {e}')

        # Remove customer info and credentials from room document
        room_ref.update({
            'status': 'Available',
            'booked_by': DELETE_FIELD,
            'customer_name': DELETE_FIELD,
            'customer_contact': DELETE_FIELD,
            'customer_cnic': DELETE_FIELD,
            'booking_time': DELETE_FIELD,
            'customer_email': DELETE_FIELD,
            'customer_uid': DELETE_FIELD,
            'customer_password': DELETE_FIELD
        })
        return jsonify({'success': True, 'message': 'Booking cancelled successfully!'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/reset_all_bookings/<room_type>', methods=['POST'])
def reset_all_bookings(room_type):
    """API endpoint to reset all bookings for a specific room type."""
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401

    try:
        rooms_ref = db.collection('rooms').where('type', '==', room_type).stream()
        batch = db.batch()
        for doc in rooms_ref:
            room_ref = db.collection('rooms').document(doc.id)
            batch.update(room_ref, {
                'status': 'Available',
                'booked_by': DELETE_FIELD,
                'customer_name': DELETE_FIELD,
                'customer_contact': DELETE_FIELD,
                'customer_cnic': DELETE_FIELD,
                'booking_time': DELETE_FIELD
            })
        batch.commit()
        return jsonify({'success': True, 'message': f'All {room_type} room bookings reset successfully.'}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# --- Initial Data Setup (Run once to populate Firestore with rooms) ---
# You can uncomment and run this function once to populate your Firestore 'rooms' collection.
# Make sure your Firebase Admin SDK is correctly initialized before running this.
@app.route('/setup_initial_rooms')
def setup_initial_rooms():
    """
    Sets up initial room data in Firestore.
    Run this once to populate your database.
    """
    try:
        # Check if rooms already exist to prevent duplicates
        existing_rooms = db.collection('rooms').limit(1).get()
        if len(existing_rooms) > 0:
            return "Rooms already exist in Firestore. Skipping initial setup.", 200

        rooms_to_add = []
        # Premium Rooms (101-110)
        for i in range(101, 111):
            rooms_to_add.append({
                'room_number': i,
                'type': 'premium',
                'status': 'Available',
                'price': 5000
            })
        # Semi-Premium Rooms (201-210)
        for i in range(201, 211):
            rooms_to_add.append({
                'room_number': i,
                'type': 'semi-premium',
                'status': 'Available',
                'price': 3500
            })
        # Economy Rooms (301-330)
        for i in range(301, 331):
            rooms_to_add.append({
                'room_number': i,
                'type': 'economy',
                'status': 'Available',
                'price': 2000
            })

        batch = db.batch()
        for room_data in rooms_to_add:
            doc_ref = db.collection('rooms').document(f"{room_data['type']}_{room_data['room_number']}")
            batch.set(doc_ref, room_data)
        batch.commit()
        return "Initial rooms added to Firestore successfully!", 200
    except Exception as e:
        return f"Error setting up initial rooms: {e}", 500


if __name__ == '__main__':
    app.run(debug=True)
