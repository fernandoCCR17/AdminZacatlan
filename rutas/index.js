// importamos tanto la dependecia express como los metodos que mandaremos a llamar en las rutas
import express from "express";
import { paginaLogin, paginaInicio, paginaPublicidad, paginaAnadirHotel, paginaAnadirGerente, paginaAnadirHabitacion, paginaEditarHotel, paginaEditarGerente, paginaEditarHabitacion, 
    paginaVerMas, listaHoteles, listaGerentes, listaHabitaciones, cerrarSesion} from "../controller/paginasControlador.js";
import { guardarHotel, cambiarHotel, deleteHotel} from "../controller/hotelControlador.js";
import { guardarGerente, cambiarGerente, deleteGerente} from "../controller/gerenteControlador.js";
import { guardarHabitacion, cambiarHabitacion, deleteHabitacion} from "../controller/habitacionControlador.js";
// variable rutas que nos va a permitir el direccionamiento
const rutas = express.Router();
// direccionamiento de la pagina prinipal y para ver detalles de cada hotel
rutas.get("/", paginaLogin);
rutas.get("/inicio", paginaInicio);
rutas.get("/publicidad", paginaPublicidad);
rutas.get("/cerrarsesion", cerrarSesion);
rutas.get("/verMas/:id_htl", paginaVerMas);

// direccionamiento para editar y crear hoteles
rutas.get("/anadirHotel", paginaAnadirHotel);
rutas.post("/anadirHotel", guardarHotel);
rutas.get("/editarHotel/:id_htl", paginaEditarHotel);
rutas.post("/editarHotel/:id_htl", cambiarHotel);
rutas.get("/deleteHotel/:id_htl", deleteHotel);
rutas.get("/listaHoteles", listaHoteles);

// direccionamiento para editar y crear Gerentes
rutas.get("/anadirGerente", paginaAnadirGerente);
rutas.post("/anadirGerente", guardarGerente);
rutas.get("/editarGerente/:id_grt", paginaEditarGerente);
rutas.post("/editarGerente/:id_grt", cambiarGerente);
rutas.get("/deleteGerente/:id_grt", deleteGerente);
rutas.get("/listaGerentes", listaGerentes);

// direccionamiento para editar y crear Habitaciones
rutas.get("/anadirHabitacion", paginaAnadirHabitacion);
rutas.post("/anadirHabitacion", guardarHabitacion);
rutas.get("/editarHabitacion/:id_hbt", paginaEditarHabitacion);
rutas.post("/editarHabitacion/:id_hbt", cambiarHabitacion);
rutas.get("/deleteHabitacion/:id_hbt", deleteHabitacion);
rutas.get("/listaHabitaciones", listaHabitaciones);

export default rutas;