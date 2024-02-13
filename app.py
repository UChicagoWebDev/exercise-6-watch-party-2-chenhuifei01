# app.py

import string
import random
from datetime import datetime
from flask import Flask, g, jsonify, request
import sqlite3
from functools import wraps
import os

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0


def get_db():
    db = getattr(g, '_database', None)

    if db is None:
        db = g._database = sqlite3.connect('db/watchparty.sqlite3')
        db.row_factory = sqlite3.Row
        setattr(g, '_database', db)
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


def query_db(query, args=(), one=False):
    db = get_db()
    cursor = db.execute(query, args)
    rows = cursor.fetchall()
    db.commit()
    cursor.close()
    if rows:
        if one:
            return rows[0]
        return rows
    return None


def new_user():
    name = "Unnamed User #" + ''.join(random.choices(string.digits, k=6))
    password = ''.join(random.choices(
        string.ascii_lowercase + string.digits, k=10))
    api_key = ''.join(random.choices(
        string.ascii_lowercase + string.digits, k=40))
    u = query_db('insert into users (name, password, api_key) ' +
                 'values (?, ?, ?) returning id, name, password, api_key',
                 (name, password, api_key),
                 one=True)
    return u

# TODO: If your app sends users to any other routes, include them here.
#       (This should not be necessary).


@app.route('/')
@app.route('/profile')
@app.route('/login')
@app.route('/room')
@app.route('/room/<chat_id>')
def index(chat_id=None):
    return app.send_static_file('index.html')


@app.errorhandler(404)
def page_not_found(e):
    return app.send_static_file('404.html'), 404


# -------------------------------- API ROUTES ----------------------------------

# TODO: Create the API

def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Or however you choose to send the API key
        api_key = request.headers.get('X-API-Key')
        if api_key and query_db('SELECT * FROM users WHERE api_key = ?', (api_key,), one=True):
            return f(*args, **kwargs)
        else:
            return jsonify({"success": False, "message": "Invalid or missing API key."}), 401
    return decorated_function

# -------------------------------- Users ----------------------------------
# User


@app.route('/api/signup', methods=['POST'])
def signup():
    # create a new user
    user = new_user()
    if user:
        # Assuming `new_user` function returns a user with an API key
        return jsonify({
            "success": True,
            "api_key": user["api_key"],
            "user_name": user["name"],
            "user_id": user["id"]
        }), 200
    return jsonify({"success": False, "error": "User creation failed"}), 500


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({
            "success": False,
            "message": "Username and password are required."
        }), 400

    user = query_db('SELECT * FROM users WHERE name = ? AND password = ?',
                    (username, password), one=True)

    if user:
        return jsonify({
            "success": True,
            "api_key": user['api_key'],
            "username": user['name'],
            "userid": user["id"]}), 200
    else:
        return jsonify({
            "success": False,
            "message": "Invalid username or password."
        }), 401


@app.route('/api/update_username', methods=['POST'])
@require_api_key
def update_username():
    data = request.get_json()
    api_key = data.get('api_key')
    new_name = data.get('new_name')

    # Validate input
    if not api_key or not new_name:
        return jsonify({"success": False, "message": "API key and new name are required."}), 400

    # Find the user by API key
    user = query_db('SELECT * FROM users WHERE api_key = ?',
                    (api_key,), one=True)
    if user:
        try:
            query_db('UPDATE users SET name = ? WHERE api_key = ?',
                     (new_name, api_key))
            return jsonify({"success": True, "message": "Username updated successfully."}), 200
        except sqlite3.Error as e:
            return jsonify({"success": False, "message": "Database error occurred."}), 500
    else:
        return jsonify({"success": False, "message": "Invalid API key."}), 404


@app.route('/api/update_password', methods=['POST'])
@require_api_key
def update_password():
    data = request.get_json()
    api_key = data.get('api_key')
    new_password = data.get('new_password')
    confirm_password = data.get('confirm_password')

    # Validate input
    if not api_key or not new_password or not confirm_password:
        return jsonify({"success": False, "message": "API key, new password, and confirm password are required."}), 400

    if new_password != confirm_password:
        return jsonify({"success": False, "message": "Passwords do not match."}), 400

    # Find the user by API key
    user = query_db('SELECT * FROM users WHERE api_key = ?',
                    (api_key,), one=True)
    if user:
        try:
            query_db('UPDATE users SET password = ? WHERE api_key = ?',
                     (new_password, api_key))
            return jsonify({"success": True, "message": "Password updated successfully."}), 200
        except sqlite3.Error as e:
            return jsonify({"success": False, "message": "Database error occurred."}), 500
    else:
        return jsonify({"success": False, "message": "Invalid API key."}), 404


# -------------------------------- Rooms ----------------------------------
@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    rooms = query_db('SELECT * FROM rooms', args=(), one=False)
    if rooms:
        return jsonify([{"id": room["id"], "name": room["name"]} for room in rooms]), 200
    else:
        return jsonify({"success": False, "message": "No rooms found"}), 404


@app.route('/api/create_room', methods=['POST'])
@require_api_key
def create_room():
    data = request.get_json()
    room_name = data.get('room_name')

    if not room_name:
        return jsonify({"success": False, "message": "Room name is required."}), 400

    try:
        new_room = query_db('INSERT INTO rooms (name) VALUES (?) RETURNING id, name',
                            [room_name], one=True)
        return jsonify({"success": True, "room": dict(new_room)}), 201
    except sqlite3.Error as e:
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/api/room/<int:room_id>', methods=['GET'])
def get_room(room_id):
    room = query_db('SELECT * FROM rooms WHERE id = ?', (room_id,), one=True)
    if room:
        return jsonify(dict(room)), 200
    else:
        return jsonify({"success": False, "message": "Room not found"}), 404


@app.route('/api/room/<int:room_id>/update_name', methods=['POST'])
@require_api_key
def update_room_name(room_id):
    data = request.get_json()
    new_name = data.get('new_name')
    if not new_name:
        return jsonify({"success": False, "message": "New room name is required."}), 400

    try:
        db = get_db()
        db.execute('UPDATE rooms SET name = ? WHERE id = ?',
                   (new_name, room_id))
        db.commit()
        return jsonify({"success": True, "message": "Room name updated successfully."}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# -------------------------------- messages ----------------------------------
# GET to get all the messages in a room
# query data from database, and send json format to js function


@app.route('/api/rooms/<int:room_id>/messages', methods=['GET'])
def get_room_messages(room_id):
    query = """
    SELECT m.id, m.body, u.name as author, m.room_id
    FROM messages m
    JOIN users u ON m.user_id = u.id
    WHERE m.room_id = ?
    ORDER BY m.id ASC;
    """
    db = get_db()
    cur = db.execute(query, [room_id])
    messages = cur.fetchall()

    messages_list = [dict(id=row['id'], body=row['body'],
                          author=row['author'], room_id=row['room_id']) for row in messages]
    return jsonify(messages_list)


# POST to post a new message to a room
@app.route('/api/rooms/<int:room_id>/messages/post', methods=['POST'])
@require_api_key
# @require_api_key
def post_room_message(room_id):
    data = request.get_json()
    userid = data.get('userid')
    if userid is None:
        return jsonify({'error': 'Authentication required'}), 403

    # Extracting message body from the POST request
    message_body = data.get('body')
    print("message_body: ", message_body)
    if not message_body:
        return jsonify({'error': 'Message body is required'}), 400

    # Insert message into the database
    try:
        query = """
        INSERT INTO messages (user_id, room_id, body)
        VALUES (?, ?, ?)
        """
        query_db(query, [userid, room_id, message_body])
        return jsonify({'success': 'Message posted successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# -------------------------------- API RUN ----------------------------------
app.run(host='0.0.0.0', port=3500, debug=True)
