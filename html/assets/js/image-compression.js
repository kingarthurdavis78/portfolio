function matrix_multiplication(A, B) {
    let result = [];
    for (let i = 0; i < A.length; i++) {
        result[i] = [];
        for (let j = 0; j < B[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < A[0].length; k++) {
                sum += A[i][k] * B[k][j];
            }
        result[i][j] = sum;
        }
    }
    return result;
}

function transpose(A) {
     let result = [];
     for (let i = 0; i < A[0].length; i++) {
         result[i] = [];
         for (let j = 0; j < A.length; j++) {
             result[i][j] = A[j][i];
         }
     }
     return result;
}

function diagonalize_vector(v) {
     let result = [];
     for (let i = 0; i < v.length; i++) {
         result[i] = [];
         for (let j = 0; j < v.length; j++) {
             result[i][j] = 0;
         }
         result[i][i] = v[i];
     }
     return result;
}

function reorder(u, v, q) {
     // make q in descending order and reorder u and v accordingly
     u = transpose(u)
     v = transpose(v)
     let q2 = [];
     let u2 = [];
     let v2 = [];
     while (q.length > 0) {
         // find max
         let max = q[0];
         let maxIndex = 0;
         for (let i = 1; i < q.length; i++) {
             if (q[i] > max) {
                 max = q[i];
                 maxIndex = i;
             }
         }
         // add max to q2
         q2.push(max);
         // remove max from q
         q.splice(maxIndex, 1);
         // add corresponding column of u to u2
         u2.push(u[maxIndex]);
         u.splice(maxIndex, 1);
         // add corresponding column of v to v2
         v2.push(v[maxIndex]);
         v.splice(maxIndex, 1);
     }


     return [transpose(u2), transpose(v2), q2];
}

let U_red;
let V_red;
let Q_red;
let U_green;
let V_green;
let Q_green;
let U_blue;
let V_blue;
let Q_blue;


function loadingScreen(ctx) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Loading...", canvas.width / 2 - 75, canvas.height / 2);
    // update screen
    ctx.beginPath();
    ctx.stroke();
    ctx.closePath();
    ctx.fill();


}

function load_image(img = null) {
    // show loading screen
    let canvas = document.getElementById("canvas");
    canvas.width = 300;
    canvas.height = 300;
    let ctx = canvas.getContext("2d");
    let compressedCanvas = document.getElementById("compressedCanvas");
    compressedCanvas.width = 300;
    compressedCanvas.height = 300;
    let compressedCtx = compressedCanvas.getContext("2d");
    loadingScreen(compressedCtx);
    loadingScreen(ctx);


    // max width and height of image are the window width and height
    const MAX_WIDTH = window.innerWidth / 2;
    const MAX_HEIGHT = window.innerHeight / 2;
    const image = new Image();

    if (img == null) {
        const input = document.getElementById("inputImageFile");
        const imageFile = input.files[0];
        image.src = URL.createObjectURL(imageFile);
    }
    else {
        image.src = img;
    }
    image.onload = function() {
        // rescale image if necessary
        if (image.width > MAX_WIDTH) {
            image.height *= MAX_WIDTH / image.width;
            image.width = MAX_WIDTH;
        }
        if (image.height > MAX_HEIGHT) {
            image.width *= MAX_HEIGHT / image.height;
            image.height = MAX_HEIGHT;
        }
        canvas.width = image.width;
        canvas.height = image.height;
        compressedCanvas.width = image.width;
        compressedCanvas.height = image.height;
        ctx.drawImage(image, 0, 0);


        // get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // get red, green, and blue values
        let red = [];
        let green = [];
        let blue = [];

        for (let i = 0; i < data.length; i += 4) {
            red.push(data[i]);
            green.push(data[i + 1]);
            blue.push(data[i + 2]);
        }

        // convert each to mxn matrix
        let red_matrix = [];
        let green_matrix = [];
        let blue_matrix = [];

        for (let i = 0; i < canvas.height; i++) {
            red_matrix[i] = [];
            green_matrix[i] = [];
            blue_matrix[i] = [];
            for (let j = 0; j < canvas.width; j++) {
                red_matrix[i][j] = red[i * canvas.width + j];
                green_matrix[i][j] = green[i * canvas.width + j];
                blue_matrix[i][j] = blue[i * canvas.width + j];
            }
        }
        // if m < n, transpose each matrix
        if (canvas.height < canvas.width) {
            red_matrix = transpose(red_matrix);
            green_matrix = transpose(green_matrix);
            blue_matrix = transpose(blue_matrix);
        }

        const red_svd = SVDJS.SVD(red_matrix);
        const green_svd = SVDJS.SVD(green_matrix);
        const blue_svd = SVDJS.SVD(blue_matrix);

        // reorder each matrix
        let [red_u, red_v, red_q] = reorder(red_svd.u, red_svd.v, red_svd.q);
        let [green_u, green_v, green_q] = reorder(green_svd.u, green_svd.v, green_svd.q);
        let [blue_u, blue_v, blue_q] = reorder(blue_svd.u, blue_svd.v, blue_svd.q);

        // save u, v, and q
        U_red = red_u;
        V_red = red_v;
        Q_red = red_q;
        U_green = green_u;
        V_green = green_v;
        Q_green = green_q;
        U_blue = blue_u;
        V_blue = blue_v;
        Q_blue = blue_q;

        // update image size calculation
        let imageSize = document.getElementById("imageSize");
        imageSize.innerHTML = "Stored Values: " + (data.length / 4);


        // update slider so max is number of singular values
        let slider = document.getElementById("singularValueSlider");
        slider.max = Math.floor(red_q.length / 2);
        slider.value = Math.floor(red_q.length / 2) / 10;
        // update label for singular value slider
        let sliderLabel = document.getElementById("sliderLabel");
        sliderLabel.innerHTML = "Singular Values: " + slider.value;

        image_compression();
    }
}


function image_compression() {
    let compressedCanvas = document.getElementById("compressedCanvas");
    let compressedCtx = compressedCanvas.getContext("2d");
    loadingScreen(compressedCtx);


    // get k
    let slider = document.getElementById("singularValueSlider");
    let k = slider.value;
    // update label for singular value slider
    let sliderLabel = document.getElementById("sliderLabel");
    sliderLabel.innerHTML = "Singular Values: " + slider.value;



    // get u_k
    let red_u_k = U_red.slice(0, U_red.length).map(row => row.slice(0, k));
    let green_u_k = U_green.slice(0, U_green.length).map(row => row.slice(0, k));
    let blue_u_k = U_blue.slice(0, U_blue.length).map(row => row.slice(0, k));

    // get q_k
    let red_q_k = Q_red.slice(0, k);
    let green_q_k = Q_green.slice(0, k);
    let blue_q_k = Q_blue.slice(0, k);

    // get v_k
    let red_v_k = V_red.slice(0, V_red.length).map(row => row.slice(0, k));
    let green_v_k = V_green.slice(0, V_green.length).map(row => row.slice(0, k));
    let blue_v_k = V_blue.slice(0, V_blue.length).map(row => row.slice(0, k));

    // update image size calculation
    let imageSize = document.getElementById("compressedImageSize");
    imageSize.innerHTML = "Stored Values: " + (k * (compressedCanvas.height + compressedCanvas.width + 1));

    // get A_k
    let red_A_k = matrix_multiplication(matrix_multiplication(red_u_k, diagonalize_vector(red_q_k)), transpose(red_v_k));
    let green_A_k = matrix_multiplication(matrix_multiplication(green_u_k, diagonalize_vector(green_q_k)), transpose(green_v_k));
    let blue_A_k = matrix_multiplication(matrix_multiplication(blue_u_k, diagonalize_vector(blue_q_k)), transpose(blue_v_k));

    // if m < n, transpose A_k
    if (compressedCanvas.height < compressedCanvas.width) {
        red_A_k = transpose(red_A_k);
        green_A_k = transpose(green_A_k);
        blue_A_k = transpose(blue_A_k);
    }


    // convert to 1D array
     let A_k_1d = [];
    for (let i = 0; i < compressedCanvas.height; i++) {
        for (let j = 0; j < compressedCanvas.width; j++) {
            A_k_1d.push(red_A_k[i][j]);
            A_k_1d.push(green_A_k[i][j]);
            A_k_1d.push(blue_A_k[i][j]);
            A_k_1d.push(255);
        }
    }

    // convert to Uint8ClampedArray
    let A_k_1d_u8 = new Uint8ClampedArray(A_k_1d);
    // convert to ImageData
    let imageData_k = new ImageData(A_k_1d_u8, compressedCanvas.width, compressedCanvas.height);
    // draw image on canvas
    compressedCtx.putImageData(imageData_k, 0, 0);
}


//load cougar image
load_image("assets/imgs/cougar.jpg");
