import { html, outerHTML, innerHTML } from 'https://cdn.skypack.dev/diffhtml';
import { data } from '/data.js'


const list = document.getElementById('server-list');
Object.values(data.servers).forEach(server => {
  var info_format = `

    SERVER INFO:<br>
    upload date: ${server.date}<br>
    status: ${server.status}<br>
    type: ${server.type}<br>
    server name: ${server.name}<br>
    server ID: ${server.id}<br>
    file: <a href="${server.files}">cloud storage (click)</a><br><br>
    INVITE INFO:<br>
    status: ${server.server_invite.invite_status}<br>
    link: <a href="${server.server_invite.link}">${server.server_invite.link}</a><br>
    <br>
  `;
  var cardHTML = `
        <div class="server-card">
      <div class="card-image">
        <img src="${server.image}" alt="">
      </div>
      <div class="card-title">
        <h3>${server.title}</h3>
      </div>
            <div class="card-description">
        <br><br>
        Description:<br><br>
        ${server.description}
      </div>
 
      <div class="card-description"><br><br>
        ${info_format}
      </div>
    </div>
      `;

  list.innerHTML += cardHTML;
  console.log(cardHTML)
});