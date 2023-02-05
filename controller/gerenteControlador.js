import { Gerente } from "../models/Gerente.js";
import { Hotel } from "../models/Hotel.js";
import path from "path";

const guardarGerente = async (req, res) => {
  const { nombre, apellido_paterno, apellido_materno, telefono, id_htl } = req.body;
  const { files } = req
  const gerentes = await Gerente.findAll();
  const errores = [];

  // console.log(files.archivo);

  // mandamos llamar una funcion para verificar que los campos no esten vacios
  verificarGerente( nombre, apellido_paterno, apellido_materno, telefono, files, gerentes,errores);

  // Verificamos que el gerente por crear este repetido
  let gerenteRepetido = false;

  gerentes.map((e) => {
    if (nombre === e.nombre &&apellido_paterno === e.apellido_paterno &&apellido_materno === e.apellido_materno &&apellido_paterno === e.apellido_paterno &&telefono === e.telefono) { gerenteRepetido = true;}
  });

  if (gerenteRepetido && errores.length === 0) {
    errores.push({ mensaje: "Este Gerente ya ha sido creado" });
  }
  // Aqui terminamos de verficar

  // si hay errores redireccionamos a la misma pagina y le pasamos los datos insertados asi como los errores generados
  if (errores.length > 0) {
    res.render("anadirGerente", {
      pagina: "anadir Gerente",
      errores,
      nombre,
      apellido_paterno,
      apellido_materno,
      telefono,
      id_htl,
    });
  } else {
    //Si no hay errores lo almacenamos en la base de datos
    try {
      
      const gerenteGuardado = await Gerente.create({
        nombre,
        apellido_paterno,
        apellido_materno,
        telefono,
      });

      const { id_grt } = gerenteGuardado;
      const fileName = files.archivo.name;
      const filepath = path.join("public/img/Gerentes", fileName);
      files.archivo.mv(filepath, (err) => {
        if (err)
          return res.send('Ha ocurrido un error');
      });
      await Gerente.update(
        { img_gerente: fileName.toString() },
        {
          where: {
            id_grt,
          },
        }
      );
      res.redirect(`/anadirGerente`);
    } catch (error) {
      console.log(error);
    }
  }
};

const cambiarGerente = async (req, res) => {
  const { id_grt } = req.params;
  const { nombre, apellido_paterno, apellido_materno, telefono, id_htl } = req.body;
  const { files } = req
  const errores = [];
  const gerentes = await Gerente.findAll();

  // mandamos llamar una funcion para verificar que los campos no esten vacios
  verificarGerente( nombre, apellido_paterno, apellido_materno, telefono, files, ['imagenGerentes'],errores);
  if(files != null){
    comprobarImgEdit(files ,gerentes, id_grt, errores);
  }
  // si hay errores redireccionamos a la misma pagina y le pasamos los datos insertados asi como los errores generados
  if (errores.length > 0) {
    res.render("editarGerente", {
      pagina: "Editar Gerente",
      id_grt: req.params.id_grt,
      errores,
      nombre,
      apellido_paterno,
      apellido_materno,
      telefono,
    });
  } else {
    //Si no hay errores lo actualizamos en la base de datos
    try {
      const fileName = files.archivo.name;
      const filepath = path.join("public/img/Gerentes", fileName);
      files.archivo.mv(filepath, (err) => {
        if (err)
          return res.send('Ha ocurrido un error');
      });
      await Gerente.update(
        { nombre, apellido_paterno, apellido_materno, telefono, img_gerente: fileName.toString()},
        {
          where: {id_grt}
        }
      );
      res.redirect("/listaGerentes");
    } catch (error) {
      console.log(error);
    }
  }
};

const deleteGerente = async (req, res) => {
  // Destruimos el gerente seleccionado
  await Hotel.update(
    { id_grt: null },
    {
      where: {
        id_grt: req.params.id_grt,
      },
    }
  );
  await Gerente.destroy({
    where: {
      id_grt: req.params.id_grt,
    },
  });
  res.redirect("/listaGerentes");
};

// Funcion que verifica que no este vacio uno o mas campos
function verificarGerente(nombre,apellido_paterno,apellido_materno,telefono,files,gerentes,errores) {
  const validPhone = /^\(?[-]?(\d{2})[-]?(\d{4})[-]?(\d{4})$/, regex = /^[A-ZÑa-zñáéíóúÁÉÍÓÚ'° ]+$/;
  if (nombre.trim() === "") {
    errores.push({ mensaje: "El nombre no debe estar vacio" });
  }else if(nombre.length > 40){
    errores.push({ mensaje: "El nombre es demasiado largo" });
  }else if (!regex.test(nombre.trim())) {
    errores.push({ mensaje: "El nombre tiene que tener solo texto" });
  }
  if (apellido_paterno.trim() === "") {
    errores.push({ mensaje: "El apellido paterno no debe estar vacio" });
  }else if(apellido_paterno.length > 40){
    errores.push({ mensaje: "El apellido paterno es demasiado largo" });
  }else if (!regex.test(apellido_paterno.trim())) {
    errores.push({ mensaje: "El apellido paterno tiene que tener solo texto" });
  }
  if (apellido_materno.trim() === "") {
    errores.push({ mensaje: "El apellido materno no debe estar vacio" });
  }else if(apellido_materno.length > 40){
    errores.push({ mensaje: "El apellido materno es demasiado largo" });
  }else if (!regex.test(apellido_materno.trim())) {
    errores.push({ mensaje: "El apellido materno tiene que tener solo texto" });
  }
  if (telefono.trim() === "") {
    errores.push({ mensaje: "El telefono no debe estar vacio" });
  }else if(telefono.length > 14){
    errores.push({ mensaje: "El telefono es demasiado largo" });
  }else if(!validPhone.test(telefono)){
    errores.push({ mensaje: "Introduzca un Telefono valido" });
  }
  if (files == null) {
    errores.push({ mensaje: "Seleccione un archivo" });
    return errores;
  } else if(files.archivo.truncated){
    errores.push({ mensaje: "Archivo demasiado grande" });
    return errores;
  }else if(files.archivo.mimetype !== 'image/png' && files.archivo.mimetype !== 'image/jpg' && files.archivo.mimetype !== 'image/jpeg'){
    errores.push({ mensaje: "Solo se puede subir una imagen .png, .jpg o .jpeg" });
    return errores;
  }
  gerentes.map((e) => {
    if (files.archivo.name === e.img_gerente ) { 
      errores.push({ mensaje: `La imagen ${files.archivo.name} ya esta asignada a un gerente` });
    }
  });
  
  return files, errores;
}

function comprobarImgEdit(files ,imagenGuardada, id_grt, errores){
  imagenGuardada.map((e) => {
    if (files.archivo.name === e.img_gerente && id_grt != e.id_grt) { 
      errores.push({ mensaje: `La imagen ${files.archivo.name} ya esta asignada a un Gerente` });
    }
  });
  return files, errores;
}

export { guardarGerente, cambiarGerente, deleteGerente }
