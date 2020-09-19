/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const WIN_Z = 0;  // default graphics window z coord in world space
const WIN_LEFT = 0; const WIN_RIGHT = 1;  // default left and right x coords in world space
const WIN_BOTTOM = 0; const WIN_TOP = 1;  // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog2/triangles.json"; // triangles file loc
const INPUT_SPHERES_URL = "https://ncsucgclass.github.io/prog2/spheres.json"; // spheres file loc
var Eye = new vec4.fromValues(0.5,0.5,-0.5,1.0); // default eye position in world space

/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var vertexBuffer; // this contains vertex coordinates in triples
var triangleBuffer; // this contains indices into vertexBuffer in triples
var colorBuffer;
var triBufferSize; // the number of indices in the triangle buffer
var vertexPositionAttrib; // where to put position for vertex 
var colorAttrib;

var inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles");


// ASSIGNMENT HELPER FUNCTIONS

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response); 
        } // end if good params
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input spheres

// set up the webGL environment
function setupWebGL() {

    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl", { alpha: false }); // get a webgl object from it
    
    try {
      if (gl == null) {
        throw "unable to create gl context -- is your browser gl ready?";
      } else {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
        gl.clearDepth(1.0); // use max when we clear the depth buffer
        gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
      }
    } // end try
    
    catch(e) {
      console.log(e);
    } // end catch
 
} // end setupWebGL

// read triangles in, load them into webgl buffers
function loadTriangles() {
    

    if (inputTriangles != String.null) {                 

        var whichSetVert; // index of vertex in current triangle set
        var whichSetTri; // index of triangle in current triangle set
        var coordArray = []; // 1D array of vertex coords for WebGL
        var indexArray = []; // 1D array of vertex indices for WebGL
        //var vtxBufferSize = 0; // the number of vertices in the vertex buffer
        //var vtxToAdd = []; // vtx coords to add to the coord array
        var indexOffset = 0; // the index offset for the current set
        var triToAdd; // tri indices to add to the index array
        //var colorsToAdd = vec3.create(); //get color sets;
        //var whichSetColor;
        //var colBufferSize = 0;
        var colorArray = [];
        var testColor = [0.6,0.4,0.4,1.0, 0.6,0.4,0.4,1.0, 0.6,0.4,0.4,1.0,
            0.6,0.4,0.4,1.0, 0.6,0.4,0.4,1.0, 0.6,0.4,0.4,1.0,
            0.6,0.4,0.4,1.0, 0.6,0.4,0.4,1.0, 0.6,0.4,0.4,1.0,
            0.6,0.6,0.4,1.0, 0.6,0.6,0.4,1.0, 0.6,0.6,0.4,1.0,
            0.6,0.6,0.4,1.0, 0.6,0.6,0.4,1.0, 0.6,0.6,0.4,1.0,
            0.6,0.6,0.4,1.0, 0.6,0.6,0.4,1.0, 0.6,0.6,0.4,1.0,
            0.6,0.6,0.4,1.0, 0.6,0.6,0.4,1.0, 0.6,0.6,0.4,1.0];
        var test2 = [1.0, 0.6, 0.0, 1.0];

        for (var whichSet=0; whichSet<inputTriangles.length; whichSet++) {

            //vec3.set(indexOffset,vtxBufferSize,vtxBufferSize,vtxBufferSize); // update vertex offset
            
            // set up the vertex coord array
            for (whichSetVert=0; whichSetVert<inputTriangles[whichSet].vertices.length; whichSetVert++) {
                //vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert];
                //coordArray.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]);
                coordArray = coordArray.concat(inputTriangles[whichSet].vertices[whichSetVert]);
                // console.log(inputTriangles[whichSet].vertices[whichSetVert]);
                colorArray = colorArray.concat(inputTriangles[whichSet].material.diffuse);
                //colorArray = colorArray.concat(1.0);
                //colorArray.push(inputTriangles[whichSet].material.diffuse[0]);
                //colorArray.push(inputTriangles[whichSet].material.diffuse[1]);
                //colorArray.push(inputTriangles[whichSet].material.diffuse[2]);
                //colorArray.push(1.0);
               // colorArray.push(Math.random());
               // colorArray.push(Math.random());
                //colorArray.push(Math.random());
                colorArray.push(1.0);
            } // end for vertices in set
            
            // set up the triangle index array, adjusting indices across sets
            for (whichSetTri=0; whichSetTri<inputTriangles[whichSet].triangles.length; whichSetTri++) {
               // vec3.add(triToAdd,indexOffset,inputTriangles[whichSet].triangles[whichSetTri]);
                triToAdd = inputTriangles[whichSet].triangles[whichSetTri];
                indexArray.push(triToAdd[0]+indexOffset,triToAdd[1]+indexOffset,triToAdd[2]+indexOffset);
            } // end for triangles in set

            indexOffset = indexOffset + inputTriangles[whichSet].vertices.length;
            //set up color array
            /*for(whichSetColor=0; whichSetColor<inputTriangles[whichSet].material.diffuse.length; whichSetColor++){
                colorsToAdd = inputTriangles[whichSet].material.diffuse[whichSetColor];
                colorArray.push(colorsToAdd[0], colorsToAdd[1], colorsToAdd[2]) //float rgb
            }*/

            //vtxBufferSize += inputTriangles[whichSet].vertices.length; // total number of vertices
            //triBufferSize += inputTriangles[whichSet].triangles.length; // total number of tris
            //colBufferSize += inputTriangles[whichSet].material.diffuse.length; // total number of color values

            
        } // end for each triangle set 
        

        //for (var e = 0; e < colorArray.length; e++){
            //console.log(colorArray[e]);
        //}

        
        // send the vertex coords to webGL
        vertexBuffer = gl.createBuffer(); // init empty vertex coord buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); // activate that buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coordArray), gl.STATIC_DRAW); // coords to that buffer

        //vertexBuffer[whichSet].itemSize = 3;

        // send the triangle indices to webGL
        triangleBuffer = gl.createBuffer(); // init empty triangle index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer); // activate that buffer
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW); // indices to that buffer

        // send the triangle colors to webGL
        colorBuffer = gl.createBuffer(); // init empty triangle color buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, colorBuffer); // activate that buffer
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Float32Array(colorArray), gl.STATIC_DRAW); // indices to that buffer

        triBufferSize = indexArray.length; // now total number of indices
        //triangleBuffer.numItems = triBufferSize;
        
        
    } // end if triangles found

    console.log(colorArray);
    
} // end load triangles

// setup the webGL shaders
function setupShaders() {

    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float;
        varying vec4 vColor;
        void main(void) {
            gl_FragColor = vColor; // all fragments are picked from json
        }
    `;

    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 vertexPosition;
        attribute vec4 color;
        varying vec4 vColor;

        void main(void) {
            gl_Position = vec4(vertexPosition, 1.0); // use the untransformed position
            vColor = color;
        }
    `;

    
    try {
        // console.log("fragment shader: "+fShaderCode);
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        // console.log("vertex shader: "+vShaderCode);
        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            var shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                vertexPositionAttrib = // get pointer to vertex shader input
                    gl.getAttribLocation(shaderProgram, "vertexPosition"); 
                gl.enableVertexAttribArray(vertexPositionAttrib); // input to shader from array
                colorAttrib = gl.getAttribLocation(shaderProgram, "color");
                gl.enableVertexAttribArray(colorAttrib);
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders

// render the loaded model
function renderTriangles() {

    /*for (var whichSet=0; whichSet<inputTriangles.length; whichSet++) {

        // bind the current triangles vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer[whichSet]); // activate
        gl.vertexAttribPointer(vertexPositionAttrib, vertexBuffer[whichSet].itemSize, gl.FLOAT, false, 0, 0); // feed
        
        // Get the diffuse color 
        var material = inputTriangles[whichSet].material;
        gl.uniform4f(colorAttrib, material.diffuse[0], material.diffuse[1], material.diffuse[2], 1.0);

        // triangle buffer: activate and render
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffer[whichSet]); // activate
        gl.drawElements(gl.TRIANGLES,triangleBuffer[whichSet].numItems, gl.UNSIGNED_SHORT,0); // render
    }*/

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // vertex buffer: activate and feed into vertex shader
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); // activate
    gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed

    //gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttrib, 4, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
    gl.drawElements(gl.TRIANGLES, triBufferSize, gl.UNSIGNED_SHORT, 0);
    
    //gl.drawArrays(gl.TRIANGLES,0,3); // render

} // end render triangles


/* MAIN -- HERE is where execution begins after window load */

function main() {
  
  setupWebGL(); // set up the webGL environment
  loadTriangles(); // load in the triangles from tri file
  setupShaders(); // setup the webGL shaders
  renderTriangles(); // draw the triangles using webGL
  
} // end main
