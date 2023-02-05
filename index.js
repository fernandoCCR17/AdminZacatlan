import express from "express";
import rutas from "./rutas/index.js";
import db from "./config/db.js";
import fileUpload from "express-fileupload";
import session from "express-session";
import { nanoid } from "nanoid";
import { Hotel } from "./models/Hotel.js";
import { Hotel_img } from "./models/Hotel_img.js";
import { Gerente } from "./models/Gerente.js";
import { Habitacion } from "./models/Habitacion.js";
import { hab_img } from "./models/hab_img.js";
import { Catalogo } from "./models/Catalogo.js";
const app = express();

//conexion de base de datos
db.authenticate()
  .then(() => console.log("Conexion Exitosa"))
  .catch((error) => console.log(error));

//definiendo el puerto
const port = process.env.PORT || 1800;

//definiendo pug para plantillas
app.set("view engine", "pug");

app.use(express.json());

//Agregar parser body para obtener los datos de un formulario
app.use(express.urlencoded({ extended: true }));

app.use(
  fileUpload({
    limits: { fileSize: 1 * 1024 * 1024 },
    createParentPath: true,
  })
);

//definiendo carpeta publica
app.use(express.static("public"));

//definiendo la sesion
app.use(
  session({
    secret: nanoid(),
    resave: true,
    saveUninitialized: true,
  })
);

//midleware
app.use(async(req, res, next) => {
  const ano = new Date();
  res.locals.tiempo = " " + ano.getFullYear();
  var arrayDeCadenas = req.url.split("/")
  if (req.url.includes("/publicidad")) {
    const usuraioRol = req.session.rol;
    const hotelesLista = await Hotel.findAll({
      include: [
        { model: Gerente, as: "gerente" },
        { model: Habitacion, as: "habitaciones" },
        {model: Hotel_img, as: 'hotel_imgs'},
      ],
    });
    
    res.render("publicidad", {
      pagina: "publicidad",
      hotelesLista,
      usuraioRol
    });
  }else if(req.url.includes(`/verMas/${arrayDeCadenas[arrayDeCadenas.length - 1]}`)){
    const usuraioRol = req.session.rol;
    const id_htl = arrayDeCadenas[arrayDeCadenas.length - 1];
    const hotel = await Hotel.findOne({
      include: [
        {model: Gerente, as: 'gerente'},
        {model: Habitacion, as: 'habitaciones'},
        {model: Hotel_img, as: 'hotel_imgs'},
      ],
      where: {
        id_htl: arrayDeCadenas[arrayDeCadenas.length - 1]
      }
    })

    const hotelImgs = await Hotel_img.findAll({
      where: {
        id_htl
      }
    });
    
    const habitaciones = await Habitacion.findAll({
      include: [
        {model: Catalogo, as: 'catalogo'},
      ],
      where: {
        id_htl
      }
    })

    const imagenHab = await hab_img.findAll();

    res.render("verMas", {
      pagina: `${hotel.nombre} ver mas `,
      hotel,
      usuraioRol,
      imagenHab,
      habitaciones,
      hotelImgs
    });
  } else {
    try {
      if (req.url === "/credenciales") {
        const { email, password } = req.body;
        let errores = [];
        const usuario = "equipo7@gmail.com", contra = "123456789";

        let correo = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, contraseña = /[A-Za-z0-9]/, expreg = /^[\s\S]{8,16}$/;
        if (email === "") {
          errores.push({ mensaje: "El email no debe ser vacio" });
        } else if (!correo.test(email.trim())) {
          errores.push({ mensaje: "Introduzca un email valido" });
        }
        if (password === "") {
          errores.push({ mensaje: "La contraseña no debe estar vacia" });
        } else if (!contraseña.test(password.trim())) {
          errores.push({
            mensaje: "La contraseña no debe llevar caracteres especiales",
          });
        } else if (!expreg.test(password.trim())) {
          errores.push({
            mensaje: "La contraseña debe tener un minimo de 8 caracteres y un maximo de 16",
          });
        }
        if(errores.length == 0){
          if (email != usuario || password != contra){
            errores.push({ mensaje: "Usuario no valido" });
          }
        }
        if(errores.length > 0){
          res.render("login", {
            pagina: "Inicio de Sesión",
            email,
            errores,
          });
        }else{
          if (email === usuario && password === contra) {
            req.session.nombre = "FES";
            req.session.rol = "adm";
            res.redirect("/inicio");
          }
        }
      } else {
        if (req.session.rol === undefined) {
          res.render("login", {
            pagina: "Inicio de Sesión",
          });
        } else {
          return next();
        }
      }
    } catch (e) {
      res.render("login", {
        pagina: "Inicio de Sesión",
      });
    }
  }
});

//definiendo rutas
app.use("/", rutas);

app.listen(port, () => {
  console.log(`Servidor iniciando en el puerto` + port);
});
