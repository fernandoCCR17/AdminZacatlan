import { Habitacion } from "../models/Habitacion.js";
import { Hotel } from "../models/Hotel.js";
import { hab_img } from "../models/hab_img.js";
import { Catalogo } from "../models/Catalogo.js";
import path from 'path';

const guardarHabitacion = async (req, res) => {
  const {id_cat} = req.body;
  const { files } = req;
  const errores = [];
  const imgHabit = await hab_img.findAll();
  // mandamos llamar la funcion que verifica que todos los campos esten llenos
  verificarHabitacion(id_cat, files, imgHabit,errores);
  
  // si hay un error cargamos la misma pagina y cargamos los errores
  if (errores.length > 0) {
    const catalogo = await Catalogo.findAll();
    res.render("anadirHabitacion", {
      pagina: "anadir Habitación",
      id_cat,
      miHabitacion: id_cat,
      errores,
      catalogo
    });
  } else {
    //Si no hay ningun error almacenamos en la base de datos
    try {
      const habitacion = await Habitacion.create({
        id_cat
      });

      const { id_hbt } = habitacion;
     
      let promises = [], nombre=[], filepath;
      if(files.archivo.length > 1){
        files.archivo.forEach(file => {
          filepath = path.join("public/img/Habitaciones", file.name);
          promises.push(file.mv(filepath));
          nombre.push(file.name);
          hab_img.create(
            { 
              id_hbt,
              id_cat: id_cat,
              habImg: file.name.toString(),
            },
          );
        })
      }else{
        filepath = path.join("public/img/Habitaciones", files.archivo.name);
        promises.push(files.archivo.mv(filepath));
        nombre.push(files.archivo.name);
        hab_img.create(
          { 
            id_hbt,
            id_cat: id_cat,
            habImg: files.archivo.name,
          },
        );
      }
      await Promise.all(promises);

      res.redirect(`/anadirHabitacion`);
    } catch (error) {
      console.log(error);
    }
  }
};

const cambiarHabitacion = async (req, res) => {
  const { id_hbt } = req.params;
  const {id_cat} = req.body;
  const { files } = req;
  const errores = [];
  const imagenGuardada = await hab_img.findAll();
  // verfiacmos que los campos no esten vacios
  verificarHabitacion(id_cat, files, ['imgHabit'],errores);
  if(files != null){
    comprobarImgEdit(files ,imagenGuardada, id_hbt, errores);
  }

  console.log(id_cat);

  // Si hay errores se lo notificamos al usuario
  if (errores.length > 0) {
    const catalogo = await Catalogo.findAll();
    res.render("editarHabitacion", {
      pagina: "Editar Habitación",
      id_hbt,
      id_cat,
      errores,
      miHabitacion: req.body.id_cat,
      catalogo
    });
    // const catalogo = await Catalogo.findAll();
    // res.render("editarHabitacion", {
    //   pagina: "Editar Habitación",
    //   id_hbt,
    //   id_cat,
    //   errores,
    //   catalogo
    // });
  } else {
    //Si no hay errores actualizamos en la base de datos
    try {
      let promises = [], nombre=[], filepath;
      Habitacion.update(
        { 
          id_cat,
        },
        {
          where: {
            id_hbt,
          },
        }
      );
      hab_img.destroy({where: {id_hbt,},});
      if(files.archivo.length > 1){
        files.archivo.forEach(file => {
          filepath = path.join("public/img/Habitaciones", file.name);
          promises.push(file.mv(filepath));
          nombre.push(file.name);
          hab_img.create(
            { 
              id_hbt,
              id_cat: id_cat,
              habImg: file.name,
            },
          );
        })
      }else{
        filepath = path.join("public/img/Habitaciones", files.archivo.name);
        promises.push(files.archivo.mv(filepath));
        nombre.push(files.archivo.name);
        hab_img.create(
          { 
            id_hbt,
            id_cat: id_cat,
            habImg: files.archivo.name,
          },
        );
      }
      await Promise.all(promises);
      res.redirect("/listaHabitaciones");   
    } catch (error) {
      console.log(error);
    }
  }
};

const deleteHabitacion = async (req, res) => {
  // Borramos el gerente seleccionado
  await hab_img.destroy({where: {id_hbt:req.params.id_hbt,},});

  await Habitacion.destroy({
    where: {
      id_hbt: req.params.id_hbt,
    },
  });
  res.redirect("/listaHabitaciones");
};

// Función creada para verificar que no haya uno o mas campos vacios 
function verificarHabitacion(id_cat, files, imgHabit,errores){
  if (id_cat === undefined) {
    errores.push({ mensaje: "Seleccione el tipo de habitación" });
  }
  if (files == null) {
    errores.push({ mensaje: "Seleccione un archivo" });
    return errores;
  } 
  if(files.archivo.length > 1){
    files.archivo.forEach(file => {
      if(file.truncated){
        errores.push({ mensaje: `La imagen ${file.name} es demasiado grande` });
        return errores;
      }
      if(file.mimetype !== 'image/png' && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg'){
        errores.push({ mensaje: `La imagen ${file.name} no es un tipo .png, .jpg o .jpeg`});
        return errores;
      }

      imgHabit.map((e) => {
        if (file.name === e.habImg ) { 
          errores.push({ mensaje: `La imagen ${file.name} ya esta asignada a un Habitación` });
        }
      });
    })
  }else{
    if(files.archivo.truncated){
      errores.push({ mensaje: "Archivo demasiado grande" });
      return errores;
    }
    if(files.archivo.mimetype !== 'image/png' && files.archivo.mimetype !== 'image/jpg' && files.archivo.mimetype !== 'image/jpeg'){
      errores.push({ mensaje: "Solo se puede subir una imagen .png, .jpg o .jpeg" });
      return errores;
    }
    imgHabit.map((e) => {
      if (files.archivo.name === e.habImg ) { 
        errores.push({ mensaje: `La imagen ${files.archivo.name} ya esta asignada a una Habitación` });
      }
    });
  }
  return files, errores;
}

function comprobarImgEdit(files ,imagenGuardada, id_hbt, errores){
  if(files.archivo.length > 1){
    files.archivo.forEach(file => {
      imagenGuardada.map((e) => {
        if (file.name === e.habImg && id_hbt != e.id_hbt) { 
          errores.push({ mensaje: `La imagen ${file.name} ya esta asignada a un Hotel` });
        }
      });
    })
  }else{
    imagenGuardada.map((e) => {
      if (files.archivo.name === e.habImg && id_hbt != e.id_hbt) { 
        errores.push({ mensaje: `La imagen ${files.archivo.name} ya esta asignada a un Hotel` });
      }
    });
  }
  return files, errores;
}

export{guardarHabitacion, cambiarHabitacion, deleteHabitacion}