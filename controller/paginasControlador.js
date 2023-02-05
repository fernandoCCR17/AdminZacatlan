import { Hotel } from "../models/Hotel.js";
import { Gerente } from "../models/Gerente.js";
import { Habitacion } from "../models/Habitacion.js";
import { Catalogo } from "../models/Catalogo.js";
import { Hotel_img } from "../models/Hotel_img.js";
import { hab_img } from "../models/hab_img.js";
import {Op} from "sequelize";

const paginaLogin = async (req, res) => {
  res.render("login", {
    pagina: "Inicio de Sesión",
  });
};

const paginaInicio = async (req, res) => {
  res.render("inicio", {
    pagina: "Pagina de administración de hoteles de Zacatral de las manzanas",
  });
};

const paginaPublicidad = async (req, res) => {
  // buscamos todos los hoteles existentes e incluimos los modelos de gerente y habitacion para acceder a sus valores
  const hotelesLista = await Hotel.findAll({
    include: [
      {model: Gerente, as: 'gerente'},
      {model: Habitacion, as: 'habitaciones'},
      {model: Hotel_img, as: 'hotel_imgs'},
    ]
  })

  res.render("publicidad", {
    pagina: "Inicio",
    hotelesLista
  });
};

const paginaVerMas = async (req, res) => {
  // dependiendo del hotel seleccionado, buscaremos sus datos 
  const { id_htl } = req.params;
  const hotel = await Hotel.findOne({
    include: [
      {model: Gerente, as: 'gerente'},
      {model: Habitacion, as: 'habitaciones'},
      {model: Hotel_img, as: 'hotel_imgs'},
    ],
    where: {
      id_htl
    }
  })

  res.render("verMas", {
    pagina: `${hotel.nombre} ver mas `,
    hotel
  });
};


const paginaAnadirHotel = async (req, res) => {
  let errores = [], auxiliar = [];
  const hoteles = await Hotel.findAll({
      where:{
        id_grt: {
          [Op.not]:null
        }
      }
    }
  )

  hoteles.forEach(e => {
    auxiliar.push(e.id_grt);
  });
  try {
    // buscamos las habitaciones y gerentes sin asignar ademas que mandamos a llamar a todos los hoteles existentes
    const habitaciones = await Habitacion.findAll({
      where: {
        id_htl: null
      },
      include: [{model: Catalogo, as: 'catalogo'}]
    });

    const gerentes = await Gerente.findAll({
      where: {
        id_grt: {
          [Op.notIn]: auxiliar
        },
      },
    });

    // si hay por lo menos un gerente y hotel sin asignar o ya se ha creado un hotel permitimos el direccionamiento para crear un hotel o ver el listado de hoteles
    res.render("anadirHotel", {
      pagina: "Añadir Hotel",
      gerentes,
      habitaciones,
      errores
    });
  } catch (error) {
    console.log(error);
  }
};

// direccionamiento para crear un gerente
const paginaAnadirGerente = async (req, res) => {
  res.render("anadirGerente", {
    pagina: "Añadir Gerente",
  });
};

// direccionamiento para crear una habitacion
const paginaAnadirHabitacion = async (req, res) => {
  const catalogo = await Catalogo.findAll();

  res.render("anadirHabitacion", {
    pagina: "Añadir Habitación",
    catalogo
  });
};

// direccionamiento para editar un hotel
const paginaEditarHotel = async (req, res) => {
  const { id_htl} = req.params;
  let miGerente, auxiliar=[];
  const habitaciones = await Habitacion.findAll({
    where: {
      id_htl: null
    },
    include: [{model: Catalogo, as: 'catalogo'}]
  });

  const misHabitaciones = await Habitacion.findAll({
    where: {
      id_htl: id_htl
    },
    include: [{model: Catalogo, as: 'catalogo'}]
  });

// Buscamos los hoteles que ya cuenten con un gerente
  const hoteles = await Hotel.findAll({
    where:{
      id_grt: {
        [Op.not]:null
      }
    }
  })
  // usamos una variable auxiliar para meter todos los hoteles con gerente
  hoteles.forEach(e => {
    auxiliar.push(e.id_grt);
  });

  // Buscamos los gerentes que aun no tengan un hotel asignado, esto mediante el uso 
  // de la variable auxiliar creada (la que contiene los hoteles con gerente)
  const gerentes = await Gerente.findAll({
    where: {
      id_grt: {
        [Op.notIn]: auxiliar
      },
    },
  });
  // esta variable trae los datos del hotel seleccionado mediante su PK
  const datos = await Hotel.findByPk(id_htl,
    {
      include: [
        {model: Gerente, as: 'gerente'},
        {model: Habitacion, as: 'habitaciones'},
        {model: Hotel_img, as: 'hotel_imgs'},
      ]
    }
  );

  // Si el hotel a editar cuenta con gerente, lo asignamos a la variable miGerente
  // en caso contrario lo declaramos nulo
  if(datos.id_grt != null){
    miGerente = await Gerente.findByPk(datos.id_grt);
  }else{
    miGerente = null;
  }

  res.render("editarHotel", {
    pagina: "Editar Hotel",
    id_htl: id_htl,
    datos,
    miGerente, 
    misHabitaciones,
    gerentes,
    habitaciones,
    
  });
};

// direccionamiento para editar un gerente
const paginaEditarGerente = async (req, res) => {
  const { id_grt } = req.params;
  // esta variable trae los datos del gerente seleccionado mediante su PK
  const com = await Gerente.findByPk(id_grt);
  
  res.render("editarGerente", {
    pagina: "Editar Gerente",
    id_grt: com.dataValues.id_grt,
    nombre: com.dataValues.nombre,
    apellido_paterno: com.dataValues.apellido_paterno,
    apellido_materno: com.dataValues.apellido_materno,
    telefono: com.dataValues.telefono,
    id_htl: com.dataValues.id_htl,
  });
};

// direccionamiento para editar una habitacion
const paginaEditarHabitacion = async (req, res) => {
  const { id_hbt } = req.params;
  // esta variable trae los datos de la habitacion seleccionada mediante su PK
  const com = await Habitacion.findByPk(id_hbt);
  const catalogo = await Catalogo.findAll();

  res.render("editarHabitacion", {
    pagina: "Editar Habitación",
    id_hbt,
    miHabitacion: com.dataValues.id_cat,
    catalogo
  });
};


const listaHoteles = async(req, res) => {
  const cat = await Catalogo.findAll();
  const hotelesLista = await Hotel.findAll({
    include: [
      {model: Gerente, as: 'gerente'},
      {model: Habitacion, as: 'habitaciones'},
      {model: Hotel_img, as: 'hotel_imgs'},
    ]
  })

  const hoteles = [];
  hotelesLista.forEach(e => {
    hoteles.unshift(e)
  });
  
  res.render("listaHoteles",{
    pagina: "Lista de Hoteles",
    hotelesLista,
    hoteles,
    cat
  });
}

const listaGerentes = async(req, res) => {
  const gerentes = await Gerente.findAll();
  const hoteles = await Hotel.findAll({
    include: [
      {model: Gerente, as: 'gerente'},
    ]
  });
  
  res.render("listaGerentes",{
    pagina: "Lista de Gerentes",
    gerentes,
    hoteles
  });
}

const listaHabitaciones = async(req, res) => {
  const imagenes = await hab_img.findAll();
  const habitaciones = await Habitacion.findAll({
    include: [
      {model: Catalogo, as: 'catalogo'},
    ]
  });

  const hoteles = await Hotel.findAll();

  res.render("listaHabitaciones",{
    pagina: "Lista de Habitaciones",
    hoteles,
    habitaciones,
    imagenes
  });
}

const cerrarSesion = (req, res) => {
  req.session.destroy()
  res.render("login",{
      pagina: "Inicio de Sesión",
  });
}

export {
  paginaLogin,
  paginaInicio,
  paginaPublicidad,
  paginaAnadirHotel,
  paginaAnadirGerente,
  paginaAnadirHabitacion,
  paginaEditarHotel,
  paginaEditarGerente,
  paginaEditarHabitacion,
  paginaVerMas,
  listaHoteles,
  listaGerentes,
  listaHabitaciones,
  cerrarSesion,
};