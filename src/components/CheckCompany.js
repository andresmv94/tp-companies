import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Button from "react-bootstrap/Button";
import { Alert, Form } from "react-bootstrap";
import PropTypes from 'prop-types';

const schema = yup
  .object({
    nit: yup
      .number()
      .positive()
      .integer()
      .required()
  })
  .required();
const msgErrors ={
  number: "debe ser un numero",
  min: "no puede ser negativo",
  integer: "debe ser un número entero sin puntos ni coma",
  typeError: "es un campo requerido"
}
function CheckCompany(props) {
  const { setCompany } = props;
  const [error,setError] = useState();
  const [submitting,setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const onSubmit = async (data) => {
    setSubmitting(true);
    setError(null);
    const response = await (await fetch(`${process.env.REACT_APP_JSON_SERVER_URL}/companies?identificationNumber=${data.nit}`));
    if(response.status === 200){
      const jsonData = await response.json();
      switch (jsonData.length) {
        case 0:
          // any company found
          setError(`La empresa con identificación ${data.nit} no esta registrada.`);
          break;
        case 1:
          if(jsonData[0].available){
            setCompany(jsonData[0]);
          }else{
            setError("El empresa no se encuentra habilitada");
          }
          break;
        default:
          setError(`La busqueda ${data.nit} arrojó más de un resutaldo.`);
          break;
      }
    }else{
      setError(`Ups! No se puede establecer una conexión con el servidor, código de error: ${response.status}`);
    }
    setSubmitting(false);
  };

  return (
    <div>
      <h3>Inscripción al servicio:</h3>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group>
          {" "}
          <Form.Text muted>
            Ingrese el NIt de la persona natural o jurídica para la que
            realizará el trámite. Sin incluir el digito de verificación. Luego
            seleccione "Conitnuar" para completar su solicitud{" "}
          </Form.Text>
          <br />
          <Form.Label>N.I.T.</Form.Label>
          <Form.Control type="text" placeholder="NIT" {...register("nit")} isInvalid={!!errors?.nit?.message} />
          {errors?.nit?.message && (
            <Form.Control.Feedback type="invalid">
              El NIT {msgErrors[errors.nit.type]}
            </Form.Control.Feedback>
          )}
        </Form.Group>

        <br />
        <Button variant="danger" type="submit" disabled={submitting}>
          {submitting ? "Cargando..." : "Continuar"}
        </Button>
      </Form>
      {error && <Alert className="alert-bottom" variant="danger" onClose={() => setError(null)} dismissible>
        {error} - Comuniquese con soporte técnico.
      </Alert>
      }
    </div>
  );
}

CheckCompany.propTypes = {
  setCompany: PropTypes.func.isRequired
};

export default CheckCompany;