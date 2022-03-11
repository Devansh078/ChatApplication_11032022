const chatForm = document.getElementById('chat-form');
const socket = io();
const chatMessages = document.querySelector('.chat-messages');
const roomName =  document.getElementById('room-name');
const userList = document.getElementById('users');


//get username and url..
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

//join chat
socket.emit('joinRoom', {username, room});


//get room and users
socket.on('roomUsers', ({ room, users}) => {
    outputRoomName(room);
    outputUsers(users);
});


//message from server
socket.on('message', message =>{
    console.log(message);
    outputMesage(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;

});

socket.on('locationMessage', (message) => {

    console.log('locationMessage', message);
    let li = document.createElement('li');
    let a = document.createElement('a');
    a.setAttribute('target', '_blank');
    a.setAttribute('href', message.url);
    a.innerText = ('Check Location');
    li.appendChild(a);
    document.querySelector('.chat-messages').appendChild(li);
})

//message submit
chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();

    const msg = e.target.elements.msg.value;

    //emitted msg to server..
    socket.emit('chatMessage', msg);

    //clear inputs
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})


function outputMesage(message)  {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class = "text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//add room name to dom
function outputRoomName(room){
    roomName.innerText = room;
}

function outputUsers(users){
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}
//location Sharing
document.querySelector('#send-location').addEventListener('click', (e) => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    navigator.geolocation.getCurrentPosition(function(position) {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
        console.log(position);
    }, function() {
        alert('Unable to fetch location.')
    },{maximumAge: 60000,timeout:5000,enableHighAccuracy:true}
 )
});
