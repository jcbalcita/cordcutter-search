
// search for shows by title




// where you can watch the *show*
// you need to know the show ID to get this info
let url = `https://api-public.guidebox.com/v1.43/US/rKy1Hw9qICyXezey3TcAJ2uv0bWwQkmL/show/17205/available_content`;
let xhr = new XMLHttpRequest();

xhr.open('GET', url, true);
xhr.responseType = 'json';

xhr.onload = function () {
    if (xhr.readyState === xhr.DONE) {
        if (xhr.status === 200) {
            console.log(xhr.response);
            // do moar stuff here
        }
    }
};

xhr.send();

// where you can watch a certain episode(season?) of a show


//
