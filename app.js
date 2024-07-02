//invocamos a express
const express = require("express");


const app = express();


//configuramos urlencoded para capturar los datos del formulario y no nos de error
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

// configurar el directorio  statics
app.use('/resources',express.static('statics'));
app.use('/resources',express.static(__dirname + '/statics'));


//Establecemos el motor de plantillas ejs
app.set('view engine','ejs');


// invocamos a bcryptjs
const bcryptjs = require('bcryptjs');

//variables de session
const session = require('express-session');
app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized:true

    }));

//Invocamos al modulo de conexion de la BD
const connection = require ('./controller/UserController');

//Estableciendo las rutas


app.get ('/login', (req,res)=>{
    res.render('login');
})

app.get ('/register', (req,res)=>{
    res.render('register');
})

// Método para la REGISTRACIÓN
app.post('/register', async (req, res)=>{
	const nombre = req.body.nombre;
	const email = req.body.email;
    const role = req.body.role;
	const password = req.body.password;
	let passwordHash = await bcryptjs.hash(password, 8);
    connection.query('INSERT INTO usuarios SET ?',{nombre:nombre, email:email, role:role, password:passwordHash}, async (error, results)=>{
        if(error){
            console.log(error);
        }else{            
			res.render('register', {
				alert: true,
				alertTitle: "Registration",
				alertMessage: "¡Successful Registration!",
				alertIcon:'success',
				showConfirmButton: false,
				timer: 1500,
				ruta: ''
			});
            //res.redirect('/');         
        }
	});
})

// Metodo para la autenticacion
app.post('/auth', async (req, res)=> {
	const nombre = req.body.nombre;
	const password = req.body.password;    
    let passwordHash = await bcryptjs.hash(password, 8);
	if (nombre && password) {
		connection.query('SELECT * FROM usuarios WHERE nombre = ?', [nombre], async (error, results, fields)=> {
			if( results.length == 0 || !(await bcryptjs.compare(password, results[0].password)) ) {    
				res.render('login', {
                        alert: true,
                        alertTitle: "Error",
                        alertMessage: "USUARIO y/o PASSWORD incorrectas",
                        alertIcon:'error',
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'login'    
                    });
				
							
			} else {         
				//creamos una var de session y le asignamos true si INICIO SESSION       
				req.session.loggedin = true;                
				req.session.nombre = results[0].nombre;
				res.render('login', {
					alert: true,
					alertTitle: "Conexión exitosa",
					alertMessage: "¡LOGIN CORRECTO!",
					alertIcon:'success',
					showConfirmButton: false,
					timer: 1500,
					ruta: ''
				});        			
			}			
			res.end();
		});
	} else {	
		res.render('login', {
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "¡Por Favor Ingrese un Usuario y/o Password!",
            alertIcon:'success',
            showConfirmButton: true,
            timer: false,
            ruta: 'login'
        });  
	}
});

// Método para controlar que está auth en todas las páginas
app.get('/', (req, res)=> {
	if (req.session.loggedin) {
		res.render('index',{
			login: true,
			nombre: req.session.nombre			
		});		
	} else {
		res.render('index',{
			login:false,
			nombre:'Debe iniciar sesión',			
		});				
	}
	res.end();
});

 //Logout
//Destruye la sesión.
app.get('/logout', function (req, res) {
	req.session.destroy(() => {
	  res.redirect('/') // siempre se ejecutará después de que se destruya la sesión
	})
});




/* const connection =mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MySql01!',
    database: 'ProyectoEducativo'

})  */

/* connection.connect( (err)=> {

if(err) throw err;
console.log("BD conectada");
}); */


app.listen(4200, ()=> {
    console.log ("servidor corriendo en el puerto 4200");
});