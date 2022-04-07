
export class window{
    // === private properties ===
    #id;
    #x;
    #y;
    #height;
    #width;
    #visible;
    #minimize;
    #maximize;
    #title;
    #focus;
    #resize_h;
    #resize_w;

    // env object private in window
    #env = {
        
        // drag event : DATA
        drag : {
            is_window_in_drag : false,
            call_back_function : null,
            call_back_args : [],
        },
    }


    // function take html template and processes it 
    #build = ( where_to_append , html_template ) => {
        // make window using html_template
        this.dom.window = html_template.cloneNode(true);
        
        // store window elements in dom object ===============================
        this.dom.container = this.dom.window.querySelectorAll(".container")[0];
        this.dom.top_bar = this.dom.window.querySelectorAll(".top_bar")[0];
        this.dom.title = this.dom.top_bar.querySelectorAll(".title")[0];
        this.dom.icon = this.dom.top_bar.querySelectorAll(".icon")[0];
        this.dom.minimize = this.dom.top_bar.querySelectorAll(".minimize")[0];
        this.dom.maximize = this.dom.top_bar.querySelectorAll(".maximize")[0];
        this.dom.close = this.dom.top_bar.querySelectorAll(".close")[0];

        this.dom.resize_t = this.dom.window.querySelectorAll(".resize_horizontal")[0];
        this.dom.resize_b = this.dom.window.querySelectorAll(".resize_horizontal")[1];
        
        this.dom.resize_l = this.dom.window.querySelectorAll(".resize_vertical")[0];
        this.dom.resize_r = this.dom.window.querySelectorAll(".resize_vertical")[1];

        this.dom.resize_tl = this.dom.window.querySelectorAll(".resize_corner")[0];
        this.dom.resize_tr = this.dom.window.querySelectorAll(".resize_corner")[1];
        this.dom.resize_dl = this.dom.window.querySelectorAll(".resize_corner")[2];
        this.dom.resize_dr = this.dom.window.querySelectorAll(".resize_corner")[3];
        // ====================================================================

        // set window attributes and properties 
        this.dom.window.setAttribute("id" , this.#id);
        this.dom.window.style.cssText +=  `left : ${this.#x}px`;
        this.dom.window.style.cssText +=  `top  : ${this.#y}px`;
        this.dom.window.style.cssText +=  `width  : ${this.#width}px`;
        this.dom.window.style.cssText +=  `height  : ${this.#height}px`;
        this.dom.window.style.cssText +=  `visibility  : ${ (this.#visible) ? "visible" : "hidden"}`;
        
        // set window title
        this.dom.title.textContent = this.#title;
        
        // filter no needed elements 
        if(!(this.#minimize)){
            this.dom.minimize.parentNode.removeChild(this.dom.minimize);
        }
        if(!(this.#maximize)){
            this.dom.maximize.parentNode.removeChild(this.dom.maximize);
        }


        // setup drag functionallity 
        this.dom.top_bar.addEventListener("mousedown" , (e) => {
            this.#env.drag.is_window_in_drag = true;
            e.preventDefault();

            let mouse_x = e.clientX;
            let mouse_y = e.clientY;

            document.onmousemove = ( e ) => {
                e.preventDefault();
                if( this.#env.drag.is_window_in_drag ){
                  
                    // calculate the new cursor position
                    let new_mouse_x = mouse_x - e.clientX;
                    let new_mouse_y = mouse_y - e.clientY;
                    mouse_x = e.clientX;
                    mouse_y = e.clientY;
                    
                    // set the element's new position
                    this.set.x(this.dom.window.offsetLeft - new_mouse_x);
                    this.set.y(this.dom.window.offsetTop  - new_mouse_y);

                    if(this.#env.drag.call_back_function){
                        this.#env.drag.call_back_function(this , e , ...(this.#env.drag.call_back_args) )
                    } 
                }
            };
        });
        

        this.dom.top_bar.addEventListener("mouseup", () => {
            this.#env.drag.is_window_in_drag  = false;
            document.onmousemove = null;
        });


        // append this new window to the desktop
        where_to_append.append(this.dom.window);
    }

    constructor(
        id = null , title = "window" , x = 10, y = 10 , height = 512, width = 512 , 
        focus = true , maximize_button = true , minimize_button = true , 
        visible = true , resize_in_horizontal = true , resize_in_vertical = true , 
        where_to_append = null , html_template = null 
    ){

        // check & set new values
        this.#x         = (typeof(x) == "number") ? x : 0; 
        this.#y         = (typeof(y) == "number") ? y : 0;
        this.#height    = (typeof(height) == "number") ? height : 0;
        this.#width     = (typeof(width) == "number") ? width : 0;
        this.#id        = (typeof(id) == "string") ? id : null;
        this.#visible   = (typeof(visible) == "boolean") ? visible : true;
        this.#title     = (typeof(title) == "string") ? title : null;
        this.#focus     = (typeof(focus) == "boolean") ? focus : true; 
        this.#maximize  = (typeof(maximize_button) == "boolean") ? maximize_button : true;
        this.#minimize  = (typeof(minimize_button) == "boolean") ? minimize_button : true;
        this.#resize_h  = (typeof(resize_in_horizontal) == "boolean") ? resize_in_horizontal : true;
        this.#resize_w  = (typeof(resize_in_vertical) == "boolean") ? resize_in_vertical : true;
        

        // provide html elements of that element
        this.dom = { }

        // object provide booleans represents the case of object
        this.is  = { 
            
            // for check if this window in drag right now or not  
            in_drag : () => {
                return this.#env.drag.is_window_in_drag;
            }
        }

        // object provide events 
        this.on  = {

            // when window dragged
            drag : (call_back_function = null , ...args ) => {

                // call_back_function must be function
                if(typeof(call_back_function) == "function"){
                    
                    // save call back function and it's arguments
                    this.#env.drag.call_back_function = call_back_function;
                    this.#env.drag.call_back_args = args;

                }
                else{ // mean call_back_function is not function 
                    console.error("[DESKTOPjs] parameter 'call_back_function' must be function");
                }
            }

        }

        this.#build(where_to_append , html_template);

        // object contain all abilities for modify existing values
        this.set = {

            // set new x value only if "new_x" valid number
            x : ( new_x = 0) => {
                // check
                if( typeof(new_x) == "number"){
                    this.#x =  new_x; // set new value if it valid
                    this.dom.window.style.left = this.#x + "px";
                    return true; // return confirmation :)
                }
                else { // mean invalid value
                    console.warn("[DESKTOPjs] new_x parameter must be number")
                    return false; // return confirmation :(
                }
            },
            // like x() function
            y : ( new_y = 0 ) => {
                if( typeof(new_y) == "number"){
                    this.#y = new_y;
                    this.dom.window.style.top = this.#y + "px";
                    return true;
                }
                else {
                    console.warn("[DESKTOPjs] new_y parameter must be number");
                    return false;
                }
            },

            title : ( new_title = "" ) => {

                if(typeof(new_title) != "string"){
                    console.error("[DESKTOPjs] new_title parameter must be string ");
                    return false;
                }
                else {
                    this.#title = new_title;
                    this.dom.title.textContent = this.#title;
    
                    return true;
                }

            },

            values : ( new_values = {} ) => {
                /* function need work :) */
            },

        }

        // object provides all possible needed values public or private 
        this.get = { 
            x : () => {
                return this.#x;
            },

            y : () => {
                return this.#y;
            },

            id : () => {
                return this.#id;
            },

            width : () => {
                return this.#width;
            },

            height : () => {
                return this.#height;
            },

            visible : () => {
                return this.#visible;
            },
        
            title : () => {
                return this.#title;
            },

            resize_h : () => {
                return this.#resize_h;
            },

            resize_w : () => {
                return this.#resize_w;
            },
            
            // function return object contain few values not everything 
            values : () => {
                return {
                    id : this.#id,
                    x : this.#x,
                    y : this.#y,
                    height : this.#height,
                    width : this.#width,
                    visible : this.#visible,
                    minimize : this.#minimize,
                    maximize : this.#maximize,
                    title : this.#title,
                    focus : this.#focus,
                }
            }
        }


    }


}