// script.js
// Constants to easily refer to pages
const SPLASH = document.querySelector(".splash");
const PROFILE = document.querySelector(".profile");
const LOGIN = document.querySelector(".login");
const ROOM = document.querySelector(".room");

// Custom validation on the password reset fields
const passwordField = document.querySelector(".profile input[name=password]");
const repeatPasswordField = document.querySelector(".profile input[name=repeatPassword]");
const repeatPasswordMatches = () => {
  const p = document.querySelector(".profile input[name=password]").value;
  const r = repeatPassword.value;
  return p == r;
};

const checkPasswordRepeat = () => {
  const passwordField = document.querySelector(".profile input[name=password]");
  if(passwordField.value == repeatPasswordField.value) {
    repeatPasswordField.setCustomValidity("");
    return;
  } else {
    repeatPasswordField.setCustomValidity("Password doesn't match");
  }
}

passwordField.addEventListener("input", checkPasswordRepeat);
repeatPasswordField.addEventListener("input", checkPasswordRepeat);


// -------------------------------------------- Navigate Sections -----------------------------------------
function navigateTo(path) {
  const stateObject = { path: path }; // Create a state object with data
  // console.log(`Navigating to ${path}`);
  history.pushState(stateObject, '', path);
  window.dispatchEvent(new Event('popstate'));
  // console.log('Current state:', history.state);
}

// ----------------------------------------------------
function handleNavigation() {
  const path = window.location.pathname;

  // Stop message polling if we're not on a room page
  if (!path.startsWith('/room')) {
    stopMessagePolling();
  }

  // Define showSection function here if it's not globally available
  const showSection = (section) => {
    section.style.display = 'block';
  };

  // Hide all sections initially
  SPLASH.style.display = 'none';
  PROFILE.style.display = 'none';
  LOGIN.style.display = 'none';
  ROOM.style.display = 'none';
  
  // Show the appropriate section based on the path
  if (path === '/') {
    showSection(SPLASH);
  } else if (path === '/login') {
    showSection(LOGIN);
  } else if (path === '/profile') {
    showSection(PROFILE);
  } else if (path.startsWith('/room')) {
    // Get the room ID from the URL
    const roomId = path.split('/room/')[1]; 
    // You will create this function to show the room details
    showRoom(roomId);
  } else {
    // Hide the room section and stop polling messages
    ROOM.style.display = 'none';
    stopMessagePolling();
  }
}

// ----------------------------------------------------
window.addEventListener('DOMContentLoaded', (event) => {
  // Display Username
  updateUsernameDisplay();
  // Fetch and display rooms
  fetchAndDisplayRooms();
  // stop message polling
  stopMessagePolling()
  
  // ------------------------- section / ---------------------------
  // ------------------------- Signup ---------------------------
  const signupButton = document.querySelector(".signup");
  if (signupButton) {
    signupButton.addEventListener('click', function() {
      navigateTo('/login');
      // // Hide the failed login message
      // document.getElementById('loginFailedMessage').style.display = 'none';
    });
  }

  // ------------------------- Login ---------------------------
  const loginLink = document.querySelector(".loggedOut a");
  if (loginLink) {
    loginLink.addEventListener('click', function(event) {
      event.preventDefault();
      navigateTo('/login');
      // // Hide the failed login message
      // document.getElementById('loginFailedMessage').style.display = 'none';
    });
  }

  // ------------------------- User ---------------------------
  const profileLink = document.querySelector(".loggedIn a");
  if (profileLink) {
    profileLink.addEventListener('click', function(event) {
      event.preventDefault();
      navigateTo('/profile');
    });
  }

  // ------------------------- create room ---------------------------
  const createRoomButton = document.querySelector(".create");
  if (createRoomButton) {
    createRoomButton.addEventListener('click', function() {
      const roomName = prompt("Please enter the room name:");
      if (roomName) {
        createRoom(roomName);
      }
    });
  }

  // ------------------------- section /login ---------------------------
  // ------------------------- Login ---------------------------
  // when click "login" button
  const loginnButton = document.querySelector(".loginbutton");
  if (loginnButton) {
    loginnButton.addEventListener('click', function() {
      event.preventDefault();
      // Get the username and password from the input fields
      const username = document.querySelector(".login input[name='username']").value;
      const password = document.querySelector(".login input[name='password']").value;
      
      // Check if the username and password fields are not empty
      if (!username || !password) {
        alert('Please enter both username and password.');
        return;
      }

      // Call the login function
      login(username, password);
    });
  }

  // -------------------------Create Account---------------------------
  // when click "create a new account" button
  const createAccountButton = document.querySelector(".createAccount");

  // Event listener for create account button
  createAccountButton.addEventListener('click', function(event) {
      event.preventDefault();
      signup()
  });

  // ------------------------- section /profile ---------------------------
  // -------------------------login cool---------------------------
  // when click "cool" button
  const coolButton = document.querySelector(".exit.goToSplash");
  if (coolButton) {
    coolButton.addEventListener('click', function(event) {
      event.preventDefault();
      navigateTo('/');
    });
  }

  // -------------------------logout---------------------------
  // when click "logout" button
  const logoutButton = document.querySelector(".exit.logout");
  if (logoutButton) {
    logoutButton.addEventListener('click', function(event) {
      event.preventDefault();
      logout();
    });
  }

  // -------------------------update username---------------------------
  // when click "update username" button
  const updateUsernameButton = document.querySelector("#updateUsernameButton");
  if (updateUsernameButton) {
    updateUsernameButton.addEventListener('click', function(event) {
      event.preventDefault();
      // Get the new username from the input field
      const newUsername = document.querySelector("#new_username").value;
      
      // Get the stored API key from localStorage
      const apiKey = localStorage.getItem('apiKey');
      
      // Check if the new username field is not empty
      if (!newUsername) {
        alert('Please enter the new username.');
        return;
      }

      // Call the update username function
      updateUsername(apiKey, newUsername);
    });
  }

  // -------------------------update pw---------------------------
  // when click "update password" button
  const updatePasswordButton = document.querySelector("#updatePasswordButton");
  if (updatePasswordButton) {
    updatePasswordButton.addEventListener('click', function(event) {
      event.preventDefault();
      // Get the new password and confirmation from the input fields
      const newPassword = document.querySelector("#new_password").value;
      const confirmPassword = document.querySelector("#repeatPassword").value;
      
      // Get the stored API key from localStorage
      const apiKey = localStorage.getItem('apiKey');
      
      // Check if the new password and confirmation fields are not empty and match
      if (!newPassword || !confirmPassword) {
        alert('Please enter and confirm the new password.');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        alert('Passwords do not match.');
        return;
      }

      // Call the update password function
      updatePassword(apiKey, newPassword, confirmPassword);
    });
  }

  // ------------------------- section /room ---------------------------
  // ------------------------- back to home page---------------------------
  const usernameElements = document.querySelectorAll('.loggedIn .home');
  usernameElements.forEach(element => {
    element.addEventListener('click', (event) => {
      event.preventDefault(); 
      navigateTo('/'); 
    });
  });

});

window.addEventListener('DOMContentLoaded', handleNavigation);
window.addEventListener('popstate', handleNavigation);

// -------------------------------------------- Helper -----------------------------------------
// -------------------------------- Signup ----------------------------------
function signup() {
  fetch('/api/signup', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
  })
  .then(response => response.json())
  .then(data => {
      if(data.success) {
          // Store the API key in localStorage
          localStorage.setItem('apiKey', data.api_key);
          localStorage.setItem('userName', data.user_name);
          localStorage.setItem('userId', data.user_id);
          console.log("user data:", data);
          // Display Username
          updateUsernameDisplay();
          // Navigate to the profile page or wherever you prefer
          navigateTo('/');
      } else {
          // Handle user creation failure
          console.error('User creation failed:', data.error);
      }
  })
  .catch((error) => {
      console.error('Error:', error);
  });
  }

// -------------------------------- Login ----------------------------------
function login(username, password) {
  // Hide the failed login message
  document.getElementById('loginFailedMessage').style.display = 'none';

  fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: username,
      password: password
    })
  })
  .then(response => response.json())
  .then(data => {
    if(data.success) {
      // Store the API key in localStorage
      localStorage.setItem('apiKey', data.api_key);
      localStorage.setItem('userName', data.username);
      localStorage.setItem('userId', data.userid);
      console.log("log in local storage:", localStorage);
      // Display Username
      updateUsernameDisplay();
      // Navigate to the profile page or another page as required
      navigateTo('/');
    } else {
      // Show the failed login message
      document.getElementById('loginFailedMessage').style.display = 'block'; 
    }
  })
  .catch((error) => {
    console.error('Error:', error);
    // Show the failed login message
    document.getElementById('loginFailedMessage').style.display = 'block'; 
  });
}

// -------------------------------- Logout ----------------------------------
function logout() {
  // Remove the API key from storage
  localStorage.removeItem('apiKey');
  localStorage.removeItem('userName');
  localStorage.removeItem('userId');
  console.log("log out local storage:", localStorage);
  navigateTo('/login');
}

// -------------------------------- Update Username ----------------------------------
function updateUsername(apiKey, newUsername) {

  const X_API_Key = localStorage.getItem('apiKey');

  fetch('/api/update_username', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': X_API_Key
    },
    body: JSON.stringify({
      api_key: apiKey,
      new_name: newUsername
    })
  })
  .then(response => response.json())
  .then(data => {
    if(data.success) {
      console.log("Username updated successfully");
      // Update the username in localStorage
      localStorage.setItem('userName', newUsername);
      // Optionally refresh the page or update the UI as needed
      alert('Username updated successfully.');
      // Display Username
      updateUsernameDisplay();
    } else {
      // Handle failed update
      console.error('Update failed:', data.message);
      alert('Failed to update username.');
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

// -------------------------------- Update Password ----------------------------------
function updatePassword(apiKey, newPassword, confirmPassword) {
  const X_API_Key = localStorage.getItem('apiKey');

  fetch('/api/update_password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': X_API_Key
    },
    body: JSON.stringify({
      api_key: apiKey,
      new_password: newPassword,
      confirm_password: confirmPassword
    })
  })
  .then(response => response.json())
  .then(data => {
    if(data.success) {
      console.log("Password updated successfully");
      // Optionally refresh the page or update the UI as needed
      alert('Password updated successfully.');
    } else {
      // Handle failed update
      console.error('Update failed:', data.message);
      alert('Failed to update password.');
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}


// -------------------------------- Display username ----------------------------------
function updateUsernameDisplay() {
  // Retrieve the stored username from localStorage
  const storedUsername = localStorage.getItem('userName');
  
  // Find all elements that should display the username
  const usernameDisplayElements = document.querySelectorAll('.username');
  
  // Update the text content of these elements
  usernameDisplayElements.forEach(element => {
    element.textContent = storedUsername || 'Guest';
  });
}


// -------------------------------- Display rooms ----------------------------------
function fetchAndDisplayRooms() {
  fetch('/api/rooms', {
    method: 'GET'
  })
  .then(response => response.json())
  .then(data => {
    if (data.success !== false) { // Assuming success property exists only in case of failure
      // Clear any existing rooms
      const roomList = document.querySelector('.roomList');
      roomList.innerHTML = '';

      // Append each room to the list
      data.forEach(room => {
        const roomElement = document.createElement('a');
        roomElement.textContent = `${room.id}: ${room.name}`;
        roomElement.href = `#/room/${room.id}`; // Setting a hash-based URL for the link
        roomElement.addEventListener('click', function(event) {
          event.preventDefault();
          navigateTo(`/room/${room.id}`);
        });
        roomList.appendChild(roomElement);
      });

      // Hide the 'no rooms' message if rooms are present
      const noRooms = document.querySelector('.noRooms');
      if (data.length > 0) {
        noRooms.style.display = 'none';
      } else {
        noRooms.style.display = 'block';
      }
    } else {
      console.error('Failed to fetch rooms:', data.message);
    }
  })
  .catch(error => {
    console.error('Error fetching rooms:', error);
  });
}

// -------------------------------- Create rooms ----------------------------------
function createRoom(roomName) {
  const X_API_Key = localStorage.getItem('apiKey');

  fetch('/api/create_room', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': X_API_Key
    },
    body: JSON.stringify({
      room_name: roomName
    })
  })
  .then(response => response.json())
  .then(data => {
    if(data.success) {
      console.log("Room created successfully:", data.room);
      // Optionally, refresh the list of rooms
      fetchAndDisplayRooms();
    } else {
      console.error('Room creation failed:', data.message);
      alert('Failed to create room.');
    }
  })
  .catch((error) => {
    console.error('Error creating room:', error);
    alert('Error creating room.');
  });
}


// -------------------------------- Display specific rooms ----------------------------------
function showRoom(roomId) {
  // Set the currentRoomID in localStorage
  localStorage.setItem('currentRoomID', roomId);

  fetch(`/api/room/${roomId}`, {
    method: 'GET'
  })
  .then(response => response.json())
  .then(data => {
    if(data.success !== false) { // 假設只有在失敗時才存在 success 属性
      // 更新房間名稱顯示
      const roomNameDisplay = document.querySelector('.displayRoomName strong');
      roomNameDisplay.textContent = data.name; // 假設後端回傳的數據中房間名稱為 name 属性

      // Update the invite link with the current room ID
      const inviteLink = document.getElementById('inviteLink');
      inviteLink.href = `/rooms/${roomId}`; // Update the href attribute
      inviteLink.textContent = `/rooms/${roomId}`; // Update the link text

      // 顯示房間區塊，隱藏其他不相關區塊
      ROOM.style.display = 'block';
      SPLASH.style.display = 'none';
      PROFILE.style.display = 'none';
      LOGIN.style.display = 'none';

      // Call getMessages to fetch and display messages
      startMessagePolling();
    } else {
      console.error('Failed to fetch room details:', data.message);
    }
  })
  .catch(error => {
    console.error('Error fetching room details:', error);
  });
}

// -------------------------------- Display Messages ----------------------------------
function getMessages() {
  const room_id = localStorage.getItem('currentRoomID');

  fetch(`/api/rooms/${room_id}/messages`)
    .then(response => response.json())
    .then(messages => {
      const messagesContainer = document.querySelector('.messages');
      messagesContainer.innerHTML = ''; // Clear existing messages

      messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');

        const authorElement = document.createElement('div');
        authorElement.classList.add('author');
        authorElement.textContent = `${message.author}: `;

        const bodyElement = document.createElement('div');
        bodyElement.classList.add('body');
        bodyElement.textContent = message.body;

        messageElement.appendChild(authorElement);
        messageElement.appendChild(bodyElement);

        messagesContainer.appendChild(messageElement);
      });
    })
    .catch(error => console.error('Error fetching messages:', error));
}


// -------------------------------- Messages Polling --------------------------------
// Global variable to store the message polling interval ID
let messagePollingInterval = null;

function startMessagePolling() {
  getMessages(); // Fetch immediately
  // Update to poll every 0.5 seconds and store the interval ID
  messagePollingInterval = setInterval(getMessages, 500); // Poll every 0.5 seconds
}


function stopMessagePolling() {
  if (messagePollingInterval !== null) {
    clearInterval(messagePollingInterval); // Stop polling
    messagePollingInterval = null; // Reset the interval ID
  }
}


function postMessage() {
  const room_id = localStorage.getItem('currentRoomID');
  const userid = localStorage.getItem('userId'); // Make sure this is set upon user login
  const messageBody = document.getElementById('messageInput').value;

  // Check if the messageBody is not empty
  if (messageBody.trim().length === 0) {
    alert("Please enter a message.");
    return;
  }
  
  const X_API_Key = localStorage.getItem('apiKey');

  fetch(`/api/rooms/${room_id}/messages/post`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': X_API_Key
    },
    body: JSON.stringify({ userid: userid, body: messageBody }),
  })
  .then(response => {
    if (response.ok) {
      console.log('Message posted successfully');
      document.getElementById('messageInput').value = ''; // Clear the textarea
      getMessages(); // Refresh messages to show the new one
    } else {
      console.error('Failed to post message');
      response.json().then(data => {
        if (data && typeof data === 'object' && data.error) {
          console.error('Error:', data.error);
        } else {
          console.error('Error: Unknown error from server');
        }
      }).catch(error => console.error('Error parsing error response:', error));
    }
  })
  .catch(error => console.error('Error posting message:', error));
}


// -------------------------------- Update room name --------------------------------
function updateRoomName() {
  const roomId = localStorage.getItem('currentRoomID'); // 從 localStorage 獲取當前房間 ID
  const newName = document.querySelector('.editRoomName input').value; // 獲取用戶輸入的新房間名稱
  const X_API_Key = localStorage.getItem('apiKey');

  fetch(`/api/room/${roomId}/update_name`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-API-Key': X_API_Key
      },
      body: JSON.stringify({ new_name: newName }),
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          alert('Room name updated successfully');
          // 可以在這裡更新頁面上的房間名稱顯示
          document.querySelector('.displayRoomName strong').textContent = newName;
          toggleEditRoomNameVisibility();
      } else {
          alert('Failed to update room name: ' + data.message);
      }
  })
  .catch(error => {
      console.error('Error updating room name:', error);
      alert('Error updating room name.');
  });
}


// 為更新按鈕添加事件監聽器
document.querySelector('.editRoomName button').addEventListener('click', updateRoomName);


// -------------------------------- Update room name UI management --------------------------------
function toggleEditRoomNameVisibility() {
  const editRoomDiv = document.querySelector('.editRoomName');
  if (editRoomDiv.style.display === 'none' || !editRoomDiv.style.display) {
      editRoomDiv.style.display = 'block';
  } else {
      editRoomDiv.style.display = 'none';
  }
}

document.querySelectorAll('.edit-icon').forEach(icon => {
  icon.addEventListener('click', toggleEditRoomNameVisibility);
});
