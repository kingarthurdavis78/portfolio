/*!
=========================================================
* Steller Landing page
=========================================================

* Copyright: 2019 DevCRUD (https://devcrud.com)
* Licensed: (https://devcrud.com/licenses)
* Coded by www.devcrud.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// smooth scroll
$(document).ready(function () {
	$(".nav-link").on('click', function (event) {

		if (this.hash !== "") {

			event.preventDefault();

			var hash = this.hash;

			$('html, body').animate({
				scrollTop: $(hash).offset().top
			}, 700, function () {
				window.location.hash = hash;
			});
		}
	});
});

function sendEmail() {
	// use mailto: to open default email client

	// get email address from email
	let title = document.getElementById("title").value;
	let message = document.getElementById("message").value;

	// send email
	window.open(`mailto:
		${'kingarthurdavis78@gmail.com'}
		?subject=${title}
		&body=${message}
	`);

}
let video = document.getElementById("piVideo");

// Set the playback speed (e.g., 1.5 for 1.5x speed)
video.playbackRate = 16.0;

video = document.getElementById("compressionVideo");
video.playbackRate = 16.0;

function downloadResume() {
	window.open('assets/resume.pdf');
}