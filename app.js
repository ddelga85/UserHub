const BASE_URL = 'https://jsonplace-univclone.herokuapp.com';

function fetchData(url) {
  return fetch(url).then(function (response){
    return response.json();
  }).catch(function(error){
    console.error('error')
  })
}

function fetchUsers() {
  return fetchData(`${ BASE_URL }/users`);
}



function renderUser(user) {
      return $(`<div class="user-card">
                <header>
                  <h2>${user.name}</h2>
                </header>
                <section class="company-info">
                  <p><b>Contact:</b>${user.email}</p>
                  <p><b>Works for:</b>${user.company.name}</p>
                  <p><b>Company creed:</b>${user.company.catchPhrase}</p>
                </section>
                <footer>
                  <button class="load-posts">POSTS BY ${user.username}</button>
                  <button class="load-albums">ALBUMS BY ${user.username}</button>
                </footer>
              </div>`).data('user', user)      
        
}

function renderUserList(userList) {
  $('#user-list').empty();
  userList.forEach(function (user){
    $('#user-list').append(
      renderUser(user)
    )
  });
}

$('#user-list').on('click', '.user-card .load-posts', function () {
  let selectedUser = $(this).closest('div').data().user.id
    fetchUserPosts(selectedUser).then(renderPostList)
    // render albums for this user        
});

$('#user-list').on('click', '.user-card .load-albums', function () {
  let selectedUser = $(this).closest('div').data().user.id
    fetchUserAlbumList(selectedUser).then(renderAlbumList)
    // load albums for this user
    // render albums for this user
});

/* get an album list, or an array of albums */
function fetchUserAlbumList(userId) {
  return fetchData(`${ BASE_URL }/users/${userId}/albums?_expand=user&_embed=photos`);
}

function renderAlbum(album) {
  albumElement = $(`<div class="album-card">
                      <header>
                        <h3>${album.title}, by ${album.user.username} </h3>
                      </header>
                      <section class="photo-list">                        
                      </section>
                    </div>`)
           for(let i=0; i<album.photos.length; i++){
            $('.photo-list').append(
               renderPhoto(album.photos[i])
             )
           }       
           return albumElement;         
  }


/* render a single photo */
function renderPhoto(photo) {
  return `<div class="photo-card">
            <a href="${photo.url}" target="_blank">
              <img src="${photo.thumbnailUrl}">
              <figure>${photo.title}</figure>
            </a>
          </div>`
}

/* render an array of albums */
function renderAlbumList(albumList) {
  $('#app section.active').removeClass('active');
  $('#album-list').addClass('active').empty();
  albumList.forEach(function(album){
    $('#album-list').append(
      renderAlbum(album)
    )
  })
}

function fetchUserPosts(userId) {
  return fetchData(`${ BASE_URL }/users/${ userId }/posts?_expand=user`);
}

function fetchPostComments(postId) {
  return fetchData(`${ BASE_URL }/posts/${ postId }/comments`);
}

function setCommentsOnPost(post) {
  if (post.comments) {
    return Promise.reject(null)
  }


  return fetchPostComments(post.id).then(function (comments) {
    post.comments = comments
    return post;
  });
}

function renderPost(post) {
      return $(`<div class="post-card">
                <header>
                  <h3>${post.title}</h3>
                  <h3>--- ${post.user.username}</h3>
                </header>
                <p>${post.body}</p>
                <footer>
                  <div class="comment-list"></div>
                  <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
                </footer>
              </div>`).data('post', post)
}

function renderPostList(postList) {
  $('#app section.active').removeClass('active');
  $('#post-list').addClass('active').empty();
  postList.forEach(function(post){
    $('#post-list').append(
      renderPost(post)
    )
  })
}

function toggleComments(postCardElement) {
  const footerElement = postCardElement.find('footer');

  if (footerElement.hasClass('comments-open')) {
    footerElement.removeClass('comments-open');
    footerElement.find('.verb').text('show');
  } else {
    footerElement.addClass('comments-open');
    footerElement.find('.verb').text('hide');
  }
}

$('#post-list').on('click', '.post-card .toggle-comments', function () {
  const postCardElement = $(this).closest('.post-card');
  const post = postCardElement.data('post');

  setCommentsOnPost(post)
    .then(function (post) {
      commentList = postCardElement.find($('.comment-list'))
      commentList.empty();
      for(let i=0; i<post.comments.length; i++){
        commentList.append(
          $(`<h3>${post.comments[i].body} - - - ${post.comments[i].email}</h3>`)
        )
        toggleComments(postCardElement)
      }
    })
    .catch(function () {
      toggleComments(postCardElement);
    });
});



function bootstrap() {
  fetchUsers().then(function (data){
    renderUserList(data)
  });
}

bootstrap();

