import firebase_admin
from firebase_admin import credentials, auth

# Path to your service account key
cred = credentials.Certificate('serviceAccountKey.json')
firebase_admin.initialize_app(cred)

def set_role_by_email(email, role):
    try:
        user = auth.get_user_by_email(email)
        auth.set_custom_user_claims(user.uid, {'role': role})
        print(f"Set role '{role}' for user {email} (UID: {user.uid})")
    except Exception as e:
        print(f"Error setting role for {email}: {e}")

if __name__ == "__main__":
    # Example usage:
    set_role_by_email("admin1@gmail.com", "admin")  # Replace with your admin's email
    set_role_by_email("admin2@gmail.com", "admin")  # Replace with your admin's email
    set_role_by_email("user@hotel.com", "user")   # Replace with your user's email
    # Add more as needed 