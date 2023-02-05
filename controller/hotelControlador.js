import { Gerente } from "../models/Gerente.js";
import { Hotel } from "../models/Hotel.js";
import { Habitacion } from "../models/Habitacion.js";
import { Hotel_img } from "../models/Hotel_img.js";
import { Catalogo } from "../models/Catalogo.js";
import { hab_img } from "../models/hab_img.js";
import path from "path";
import { Op } from "sequelize";

const guardarHotel = async (req, res) => {
  const datos = req.body;
  const { files } = req;
  const errores = [];
  const HotelesImg = await Hotel_img.findAll();

  // verificamos que el hotel no tenga campos vacios
  verificarHotel( datos.nombre, datos.direccion, datos.telefono, datos.correo, datos.id_grt, datos.id_hbt, files, HotelesImg, errores );
  let categorias = [], indices;

  if (datos.id_hbt) {
    if (Array.isArray(datos.id_hbt)) {
      indices = datos.id_hbt.slice();
    } else {
      indices = [datos.id_hbt.slice()];
    }

    const cat = await Habitacion.findAll({
      attributes: ["id_cat"],
      where: {
        id_hbt: indices,
      },
    });

    cat.forEach((e) => {
      categorias.push(e.id_cat);
    });

    categorias.sort();

    let repetido = 0;
    for (let i = 0; i < categorias.length; i++) {
      if (categorias[i + 1] === categorias[i]) {
        repetido++;
      }
    }
    if (repetido > 0) {
      errores.push({
        mensaje: "No puede seleccionar dos habitaciones del mismo tipo",
      });
    }
  }

  let auxiliar = [];
  const hoteles = await Hotel.findAll({
    where: {
      id_grt: {
        [Op.not]: null,
      },
    },
  });

  hoteles.forEach((e) => {
    auxiliar.push(e.id_grt);
  });

  // si hay errores cargamos la misma pagina y se lo hacemos saber al usuario
  if (errores.length > 0) {
    let miGerente = "",
      misHabitaciones = "",
      habitaciones;
    if (datos.id_grt) {
      miGerente = datos.id_grt;
    }
    if (datos.id_hbt) {
      misHabitaciones = await Habitacion.findAll({
        where: {
          id_hbt: {
            [Op.in]: indices
          }
        },
        include: [{ model: Catalogo, as: "catalogo" }],
      });;

      // buscamos todas las habitacioones aun sin asignar
      habitaciones = await Habitacion.findAll({
        where: {
          [Op.and]: [
            {
              id_htl: null,
            },
            {
              id_hbt: {
                [Op.notIn]: indices,
              },
            },
          ],
        },
        include: [{ model: Catalogo, as: "catalogo" }],
      });
    }else{
      // buscamos todas las habitacioones aun sin asignar
      habitaciones = await Habitacion.findAll({
        where: {
          id_htl: null,
        },
        include: [{ model: Catalogo, as: "catalogo" }],
      });
    }
    // buscamos los gerentes aun sin asignar
    const gerentes = await Gerente.findAll({
      where: {
        id_grt: {
          [Op.notIn]: auxiliar,
        },
      },
    });

    if (misHabitaciones) {
      console.log(misHabitaciones);
    }
    // mandamos llamar a todos los hoteles creados junto con los modelos "gerente" y "habitacion" para poder acceder a sus datos
    res.render("anadirHotel", {
      pagina: "anadirHotel",
      datos,
      habitaciones,
      gerentes,
      misHabitaciones,
      miGerente,
      errores,
    });
  } else {
    //Si no hay errores lo almacenamos en la base de datos
    try {
      const hotel = await Hotel.create({
        nombre: datos.nombre,
        direccion: datos.direccion,
        telefono: datos.telefono,
        correo: datos.correo,
        id_hbt: datos.id_hbt,
        id_grt: datos.id_grt,
      });

      // actualizamos la fk de la o las habiataciones seleccionadas
      await Habitacion.update(
        {
          id_htl: hotel.id_htl,
        },
        {
          where: {
            id_hbt: datos.id_hbt,
          },
        }
      );
      const { id_htl } = hotel;

      let promises = [],
        nombre = [],
        filepath;
      if (files.archivo.length > 1) {
        files.archivo.forEach((file) => {
          filepath = path.join("public/img/Hoteles", file.name);
          promises.push(file.mv(filepath));
          nombre.push(file.name);
          Hotel_img.create({
            id_htl,
            img_hotel: file.name,
          });
        });
      } else {
        filepath = path.join("public/img/Hoteles", files.archivo.name);
        promises.push(files.archivo.mv(filepath));
        nombre.push(files.archivo.name);
        Hotel_img.create({
          id_htl,
          img_hotel: files.archivo.name,
        });
      }
      await Promise.all(promises);

      res.redirect(`/anadirHotel`);
    } catch (error) {
      console.log(error);
    }
  }
};

const cambiarHotel = async (req, res) => {
  const { id_htl } = req.params;
  const { files } = req;
  const datos = req.body;
  const imagenGuardada = await Hotel_img.findAll();
  const errores = [];
  let misHabitaciones,
    habitaciones,
    auxiliar,
    auxiliar2 = [],
    miGerente;
  // verficamos que ningun campo de la creacion del hotel este vacio
  verificarHotel(datos.nombre,datos.direccion,datos.telefono,datos.correo,datos.id_grt,datos.id_hbt,files,["imagenGuardada"],errores);
  if (files != null) {
    comprobarImgEdit(files, imagenGuardada, id_htl, errores);
  }

  let categorias = [], indices;
  // Si del formulario enviado se selecciono una o mas habitaciones estas seran asignadas a la varibale "misHabitaciones"
  if (datos.id_hbt) {
    if (Array.isArray(datos.id_hbt)) {
      indices = datos.id_hbt.slice();
    } else {
      indices = [datos.id_hbt.slice()];
    }
  
    const cat = await Habitacion.findAll({
      attributes: ["id_cat"],
      where: {
        id_hbt: indices,
      },
    });
  
    cat.forEach((e) => {
      categorias.push(e.id_cat);
    });
  
    categorias.sort();
  
    let repetido = 0;
    for (let i = 0; i < categorias.length; i++) {
      if (categorias[i + 1] === categorias[i]) {
        repetido++;
      }
    }
    if (repetido > 0) {
      errores.push({
        mensaje: "No puede seleccionar dos habitaciones del mismo tipo",
      });
    }
    misHabitaciones = await Habitacion.findAll({
      where: {
        id_hbt: datos.id_hbt,
      },
      include: [{ model: Catalogo, as: "catalogo" }],
    });

    if (Array.isArray(datos.id_hbt)) {
      auxiliar = datos.id_hbt.slice();
    } else {
      auxiliar = [datos.id_hbt.slice()];
    }

    habitaciones = await Habitacion.findAll({
      where: {
        [Op.or]: [
          {
            [Op.and]: [
              {
                id_htl: null,
              },
              {
                id_hbt: {
                  [Op.notIn]: auxiliar,
                },
              },
            ],
          },
          {
            [Op.and]: [
              {
                id_htl: req.params.id_htl,
              },
              {
                id_hbt: {
                  [Op.notIn]: auxiliar,
                },
              },
            ],
          },
        ],
      },
      include: [{ model: Catalogo, as: "catalogo" }],
    });
  } else {
    // En caso de que no se haya seleccionado ninguna en el form, se le asignara las habitaciones que ya contaba el hotel a modificar a la var "misHabitaciones"
    misHabitaciones = await Habitacion.findAll({
      where: {
        id_htl: req.params.id_htl,
      },
      include: [{ model: Catalogo, as: "catalogo" }],
    });

    habitaciones = await Habitacion.findAll({
      where: {
        id_htl: null,
      },
      include: [{ model: Catalogo, as: "catalogo" }],
    });
  }

  // si hay un error se lo hacemos saber al usuario
  if (errores.length > 0) {
    // Buscamos los hoteles que ya cuenten con un gerente
    const hoteles = await Hotel.findAll({
      where: {
        id_grt: {
          [Op.not]: null,
        },
      },
    });
    // usamos una variable auxiliar para meter todos los hoteles con gerente
    hoteles.forEach((e) => {
      auxiliar2.push(e.id_grt);
    });

    // Buscamos los gerentes que aun no tengan un hotel asignado, esto mediante el uso
    // de la variable auxiliar creada (la que contiene los hoteles con gerente)
    const gerentes = await Gerente.findAll({
      where: {
        id_grt: {
          [Op.notIn]: auxiliar2,
        },
      },
    });
    // esta variable trae los datos del hotel seleccionado mediante su PK
    const misDatos = await Hotel.findByPk(id_htl, {
      include: [
        { model: Gerente, as: "gerente" },
        { model: Habitacion, as: "habitaciones" },
        { model: Hotel_img, as: "hotel_imgs" },
      ],
    });

    // Si el hotel a editar cuenta con gerente, lo asignamos a la variable miGerente
    // en caso contrario lo declaramos nulo
    if (misDatos.id_grt != null) {
      miGerente = await Gerente.findByPk(misDatos.id_grt);
    } else {
      miGerente = null;
    }

    res.render("editarHotel", {
      pagina: "Editar Hotel",
      id_htl: req.params.id_htl,
      errores,
      datos,
      miGerente,
      gerentes,
      misHabitaciones,
      habitaciones,
    });
  } else {
    //Si no hay errores lo actualizamos en la base de datos
    try {
      await Hotel.update(
        {
          nombre: datos.nombre,
          direccion: datos.direccion,
          telefono: datos.telefono,
          correo: datos.correo,
          id_grt: datos.id_grt,
        },
        {
          where: {
            id_htl: id_htl,
          },
        }
      );

      await Habitacion.update(
        {
          id_htl: null,
        },
        {
          where: {
            id_htl: id_htl,
          },
        }
      );

      await Habitacion.update(
        {
          id_htl: id_htl,
        },
        {
          where: {
            id_hbt: datos.id_hbt,
          },
        }
      );
      Hotel_img.destroy({
        where: {
          id_htl,
        },
      });
      let promises = [],
        nombre = [],
        filepath;
      if (files.archivo.length > 1) {
        files.archivo.forEach((file) => {
          filepath = path.join("public/img/Hoteles", file.name);
          promises.push(file.mv(filepath));
          nombre.push(file.name);
          Hotel_img.create({
            id_htl,
            img_hotel: file.name,
          });
        });
      } else {
        filepath = path.join("public/img/Hoteles", files.archivo.name);
        promises.push(files.archivo.mv(filepath));
        nombre.push(files.archivo.name);
        Hotel_img.create({
          id_htl,
          img_hotel: files.archivo.name,
        });
      }
      await Promise.all(promises);

      res.redirect("/listaHoteles");
    } catch (error) {
      console.log(error);
    }
  }
};

// borramos el hotel y las fk del gerente y habitacions relacionados las convertimos en null
const deleteHotel = async (req, res) => {
  const { id_htl } = req.params;
  const miHotel = await Hotel.findByPk(id_htl);
  const imagen = await Habitacion.findAll({ where: { id_htl } });
  if (imagen != null) {
    imagen.forEach(async (e) => {
      await hab_img.destroy({ where: { id_hbt: e.id_hbt } });
    });
  }
  await Habitacion.destroy({
    where: {
      id_htl: id_htl,
    },
  });
  await Hotel_img.destroy({
    where: {
      id_htl: id_htl,
    },
  });
  await Hotel.destroy({
    where: {
      id_htl: id_htl,
    },
  });
  await Gerente.destroy({
    where: {
      id_grt: miHotel.id_grt,
    },
  });
  res.redirect("/listaHoteles");
};

// Funcion que verifica los campos del hotel
function verificarHotel(
  nombre,
  direccion,
  telefono,
  correo,
  id_grt,
  id_hbt,
  files,
  HotelesImg,
  errores
) {
  const validPhone = /^\(?(\d{2})[-]?(\d{4})[-]?(\d{4})$/,
    regex = /^[A-ZÑa-zñáéíóúÁÉÍÓÚ'° ]+$/,
    email =
      /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
    dire = /^[ a-zA-ZñÑáéíóúÁÉÍÓÚ0-9,.'#]+$/;
  if (nombre.trim() === "") {
    errores.push({ mensaje: "El nombre no debe ser vacio" });
  }else if(nombre.length > 40){
    errores.push({ mensaje: "El nombre es demasiado largo" });
  }else if (!dire.test(nombre.trim())) {
    errores.push({ mensaje: "El nombre tiene que tener solo texto" });
  }
  if (direccion.trim() === "") {
    errores.push({ mensaje: "La direccion no debe ser vacio" });
  }else if(direccion.length > 240){
    errores.push({ mensaje: "La dirección es muy larga" });
  }else if (!dire.test(direccion.trim())) {
    errores.push({
      mensaje: "La direccion no debe contener caracteres especiales",
    });
  }
  if (telefono.trim() === "") {
    errores.push({ mensaje: "El telefono no debe ser vacio" });
  }else if(telefono.length > 14){
    errores.push({ mensaje: "El telefono es demasiado largo" });
  }else if (!validPhone.test(telefono.trim())) {
    errores.push({ mensaje: "Introduzca un Telefono valido" });
  }
  if (correo.trim() === "") {
    errores.push({ mensaje: "El correo no debe ser vacio" });
  }else if(correo.length > 140){
    errores.push({ mensaje: "El correo es demasiado largo" });
  }else if (!email.test(correo.trim())) {
    errores.push({ mensaje: "Introduzca un correo valido" });
  }
  if (id_grt === undefined) {
    errores.push({ mensaje: "Seleccione un gerente" });
  }
  if (id_hbt === undefined) {
    errores.push({ mensaje: "Seleccione por lo menos una habitación" });
  }
  if (files == null) {
    errores.push({ mensaje: "Seleccione un archivo" });
  }else if (files.archivo.length > 1) {
    files.archivo.forEach((file) => {
      if (file.truncated) {
        errores.push({ mensaje: `La imagen ${file.name} es demasiado grande` });
        return errores;
      }else if (file.mimetype !== "image/png" &&file.mimetype !== "image/jpg" &&file.mimetype !== "image/jpeg") {
        errores.push({
          mensaje: `La imagen ${file.name} no es un tipo .png, .jpg o .jpeg`,
        });
        return errores;
      }
      HotelesImg.map((e) => {
        if (file.name === e.img_hotel) {
          errores.push({
            mensaje: `La imagen ${file.name} ya esta asignada a un Hotel`,
          });
        }
      });
    });
  } else {
    if (files.archivo.truncated) {
      errores.push({ mensaje: "Archivo demasiado grande" });
    }else if (files.archivo.mimetype !== "image/png" &&files.archivo.mimetype !== "image/jpg" &&files.archivo.mimetype !== "image/jpeg") {
      errores.push({
        mensaje: `La imagen ${files.archivo.name} no es un tipo .png, .jpg o .jpeg`,
      });
    }
    HotelesImg.map((e) => {
      if (files.archivo.name === e.img_hotel) {
        errores.push({
          mensaje: `La imagen ${files.archivo.name} ya esta asignada a un Hotel`,
        });
      }
    });
  }
  return files, errores;
}

function comprobarImgEdit(files, imagenGuardada, id_htl, errores) {
  if (files.archivo.length > 1) {
    files.archivo.forEach((file) => {
      imagenGuardada.map((e) => {
        if (file.name === e.img_hotel && id_htl != e.id_htl) {
          errores.push({
            mensaje: `La imagen ${file.name} ya esta asignada a un Hotel`,
          });
        }
      });
    });
  } else {
    imagenGuardada.map((e) => {
      if (files.archivo.name === e.img_hotel && id_htl != e.id_htl) {
        errores.push({
          mensaje: `La imagen ${files.archivo.name} ya esta asignada a un Hotel`,
        });
      }
    });
  }
  return files, errores;
}

export { guardarHotel, cambiarHotel, deleteHotel };
