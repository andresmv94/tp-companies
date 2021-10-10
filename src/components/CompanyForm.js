import React from "react";
import Select from "react-select";
import PropTypes from "prop-types";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  Row,
  Stack,
} from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useState } from "react";

const schema = yup
  .object({
    identificationType: yup.string().required(),
    identificationNumber: yup.number().positive().integer().required(),
    companyName: yup
      .string()
      .trim()
      .matches(/^[aA-zZ\s]+$/,{ excludeEmptyString: true }),
    firstName: yup
      .string()
      .trim()
      .matches(/^[aA-zZ\s]+$/,{ excludeEmptyString: true }),
    secondName: yup
      .string()
      .trim()
      .matches(/^[aA-zZ\s]+$/,{ excludeEmptyString: true }),
    firstLastName: yup
      .string()
      .trim()
      .matches(/^[aA-zZ\s]+$/,{ excludeEmptyString: true }),
    secondLastName: yup
      .string()
      .trim()
      .matches(/^[aA-zZ\s]+$/,{ excludeEmptyString: true }),
    email: yup.string().email().trim().required(),
    via: yup.string().trim().required(),
    number: yup.number().positive().integer().required(),
    letter: yup
      .string()
      .trim()
      .matches(/^[aA-zZ\s]+$/,{ excludeEmptyString: true }),
    number2: yup.number().positive().integer().required(),
    letter2: yup
      .string()
      .trim()
      .matches(/^[aA-zZ\s]+$/,{ excludeEmptyString: true }),
    complement: yup.string().trim().required(),
    municipality: yup.string().trim().required(),
    cellphone: yup.number().positive().integer().required(),
  })
  .required();
const msgErrors = {
  number: "debe ser un numero",
  min: "no puede ser negativo",
  integer: "debe ser un número entero sin puntos ni coma",
  typeError: "es un campo requerido",
  email: "correo electrónico no valido",
  required: "Campo requerido",
  matches: "Caracteres no permitidos",
};

function CompanyForm(props) {
  const { company, setCompany } = props;
  const municipality = company.address.municipality.split("-");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState();
  const [msg, setMsg] = useState("");
  // form control
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });
  const [currentIdentificationType, setCurrentIdentificationType] = useState();
  const [municipalityValue, setMunicipalityValue] = useState(
    company.address.municipality
  );
  // fetch data
  const [identificationType, setIdentificationType] = useState();
  const [dbMunicipality, setDbMunicipality] = useState();
  const [via, setVia] = useState();
  useEffect(() => {
    setCurrentIdentificationType(company.identificationType);
    const fetchData = async () => {
      // fetch indetification type options
      const responseIdentificationType = await fetch(
        `${process.env.REACT_APP_JSON_SERVER_URL}/identificationType`
      );
      setIdentificationType(await responseIdentificationType.json());
      const responseMunicipality = await fetch(
        `${process.env.REACT_APP_JSON_SERVER_URL}/municipality`
      );

      // fetch municipality type options
      const jsonMunicipality = await responseMunicipality.json();
      const arrayOptions = [];
      jsonMunicipality.forEach((element) =>
        arrayOptions.push({ value: element.name, label: element.name })
      );
      setDbMunicipality(arrayOptions);

      // fetch via options
      const responseVia = await fetch(
        `${process.env.REACT_APP_JSON_SERVER_URL}/via`
      );
      setVia(await responseVia.json());
    };
    fetchData();
  }, [company]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    if(data.identificationType !== "cc"){
      if(data.companyName.trim() === ""){
        setMsg(`El nombre de la empresa no puede ser vacío`);
        setError(true);
        setSubmitting(false);
        return;
      }
    }else{
      if(data.firstName.trim() === "" || data.firstLastName.trim() === ""){
        setMsg(`El primer nombre o el primer apellido no pueden ser vacíos`);
        setError(true);
        setSubmitting(false);
        return;
      }
    }
    // prepare data
    const objectUpdated = {
      identificationType: data.identificationType,
      identificationNumber: data.identificationNumber,
      company: {
        name: data.identificationType !== "cc" ? data.companyName : "",
      },
      person:
        data.identificationType !== "cc"
          ? null
          : {
              firstName: data.firstName || "",
              secondName: data.secondName || "",
              firstLastName: data.firstLastName || "",
              secondLastName: data.secondLastName || "",
            },
      email: data.email,
      address: {
        via: data.address,
        number: data.number,
        letter: data.letter || "",
        number2: data.number2,
        letter2: data.letter2 || "",
        complement: data.complement,
        municipality: data.municipality,
      },
      cellphone: data.cellphone,
      acceptsCellMsg: data.acceptsCellMsg || false,
      acceptsEmailsMsg: data.acceptsEmailsMsg || false,
    };

    const putResponse = await fetch(
      `${process.env.REACT_APP_JSON_SERVER_URL}/companies/${company.id}`,
      {
        method: "PUT",
        body: JSON.stringify(objectUpdated),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      }
    );
    if (putResponse.status === 200) {
      const jsonData = await putResponse.json();
      setMsg(`Datos actualizados para ${jsonData.identificationNumber}`);
      setError(false);
    } else {
      setMsg(
        `Ups! No se puede establecer una conexión con el servidor, código de error: ${putResponse.status}`
      );
      setError(true);
    }
    setSubmitting(false);
  };

  if (!identificationType || !dbMunicipality || !via) {
    return (
      <center>
        <img src="/loading.svg" width="400px" style={{maxWidth:"100%"}} alt="Cargando" />
        <br /> <h4>Cargando...</h4>{" "}
        <a style={{ fontSize: 1 }} href="https://storyset.com/technology">
          Technology illustrations by Storyset
        </a>
      </center>
    );
  }
  return (
    <div>
      <h3>
        Datos de la persona natural o jurídica que solicita el servicio de
        trámites virtuales:
      </h3>
      <Alert variant="primary">
        La empresa se encuentra registrada en la camara y comercio de{" "}
        {municipality[municipality.length - 2]} para{" "}
        {municipality[municipality.length - 1]}. Para acceder al servicio de
        trámites virtuales se utilizan los datos reportados en el registro.
      </Alert>
      <Form.Text muted>
        Campos con (*) requeridos
      </Form.Text>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Container>
          <Row>
            <Col xs={12} md={6}>
              <Form.Label>* Tipo de indetificación:</Form.Label>
              <br />
              <Form.Select
                aria-label="Seleccione una..."
                {...register("identificationType")}
                defaultValue={company.identificationType}
                isInvalid={!!errors?.identificationType?.message}
                onChange={(event) =>
                  setCurrentIdentificationType(event.target.value)
                }
              >
                {identificationType.map((element, key) => {
                  return (
                    <option key={key} value={element.value}>
                      {element.label}
                    </option>
                  );
                })}
              </Form.Select>
              {errors?.identificationType?.message && (
                <Form.Control.Feedback type="invalid">
                  {msgErrors[errors.identificationType.type]}
                </Form.Control.Feedback>
              )}
            </Col>
            <Col xs={12} md={6}>
              <Form.Label>* Número de indentificación:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Sólo numeros"
                {...register("identificationNumber")}
                isInvalid={!!errors?.identificationNumber?.message}
                defaultValue={company.identificationNumber}
              />
              {errors?.identificationNumber?.message && (
                <Form.Control.Feedback type="invalid">
                  {msgErrors[errors.identificationNumber.type]}
                </Form.Control.Feedback>
              )}
            </Col>
          </Row>
        </Container>
        {currentIdentificationType !== "cc" ? (
          <Container>
            <Row>
              <Col>
                <Form.Label>* Nombre de la empresa:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Sólo letras"
                  {...register("companyName")}
                  isInvalid={!!errors?.companyName?.message}
                  defaultValue={company.company?.name}
                />
                {errors?.companyName?.message && (
                  <Form.Control.Feedback type="invalid">
                    {msgErrors[errors.companyName.type]}
                  </Form.Control.Feedback>
                )}
              </Col>
            </Row>
          </Container>
        ) : (
          <Container>
            <Row>
              <Col xs={12} md={6}>
                <Form.Label>* Primer nombre:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Sólo letras"
                  {...register("firstName")}
                  isInvalid={!!errors?.firstName?.message}
                  defaultValue={company.person?.firstName}
                />
                {errors?.firstName?.message && (
                  <Form.Control.Feedback type="invalid">
                    {msgErrors[errors.firstName.type]}
                  </Form.Control.Feedback>
                )}
              </Col>
              <Col xs={12} md={6}>
                <Form.Label>Segundo nombre:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Sólo letras"
                  {...register("secondName")}
                  isInvalid={!!errors?.secondName?.message}
                  defaultValue={company.person?.secondName}
                />
                {errors?.secondName?.message && (
                  <Form.Control.Feedback type="invalid">
                    {msgErrors[errors.secondName.type]}
                  </Form.Control.Feedback>
                )}
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={6}>
                <Form.Label>* Primer apellido:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Sólo letras"
                  {...register("firstLastName")}
                  isInvalid={!!errors?.firstLastName?.message}
                  defaultValue={company.person?.firstLastName}
                />
                {errors?.firstLastName?.message && (
                  <Form.Control.Feedback type="invalid">
                    {msgErrors[errors.firstLastName.type]}
                  </Form.Control.Feedback>
                )}
              </Col>
              <Col xs={12} md={6}>
                <Form.Label>Segundo apellido:</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Sólo letras"
                  {...register("secondLastName")}
                  isInvalid={!!errors?.secondLastName?.message}
                  defaultValue={company.person?.secondLastName}
                />
                {errors?.secondLastName?.message && (
                  <Form.Control.Feedback type="invalid">
                    {msgErrors[errors.secondLastName.type]}
                  </Form.Control.Feedback>
                )}
              </Col>
            </Row>
          </Container>
        )}
        <Container>
          <Row>
            <Col>
              <Form.Label>* Correo eletrónico:</Form.Label>
              <Form.Control
                type="text"
                placeholder="direccion de correo válida aaaa@bbb.ccc"
                {...register("email")}
                isInvalid={!!errors?.email?.message}
                defaultValue={company.email}
              />
              {errors?.email?.message && (
                <Form.Control.Feedback type="invalid">
                  {msgErrors[errors.email.type]}
                </Form.Control.Feedback>
              )}
            </Col>
          </Row>
          <Row>
            <Col md={2}>
              <Form.Label>* Vía:</Form.Label>
              <Form.Select
                aria-label="Seleccione una..."
                {...register("via")}
                defaultValue={company.address.via}
                isInvalid={!!errors?.via?.message}
              >
                {via.map((element, key) => {
                  return (
                    <option key={key} value={element.name}>
                      {element.name}
                    </option>
                  );
                })}
              </Form.Select>
              {errors?.via?.message && (
                <Form.Control.Feedback type="invalid">
                  {msgErrors[errors.via.type]}
                </Form.Control.Feedback>
              )}
            </Col>
            <Col xs={12} md={6}>
              <Container>
                <Row>
                  <Col xs={6} sm={3}>
                    <Form.Label>*Número:</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Sólo Números"
                      {...register("number")}
                      isInvalid={!!errors?.number?.message}
                      defaultValue={company.address?.number}
                    />
                    {errors?.number?.message && (
                      <Form.Control.Feedback type="invalid">
                        {msgErrors[errors.number.type]}
                      </Form.Control.Feedback>
                    )}
                  </Col>

                  <Col xs={6} sm={3}>
                    <Form.Label>Letra:</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Sólo Letras"
                      {...register("letter")}
                      isInvalid={!!errors?.letter?.message}
                      defaultValue={company.address?.letter}
                    />
                    {errors?.letter?.message && (
                      <Form.Control.Feedback type="invalid">
                        {msgErrors[errors.letter.type]}
                      </Form.Control.Feedback>
                    )}
                  </Col>

                  <Col xs={6} sm={3}>
                    <Form.Label>*Número:</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Sólo Números"
                      {...register("number2")}
                      isInvalid={!!errors?.number2?.message}
                      defaultValue={company.address?.number2}
                    />
                    {errors?.number2?.message && (
                      <Form.Control.Feedback type="invalid">
                        {msgErrors[errors.number2.type]}
                      </Form.Control.Feedback>
                    )}
                  </Col>

                  <Col xs={6} sm={3}>
                    <Form.Label>Letra:</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Sólo Letra"
                      {...register("letter2")}
                      isInvalid={!!errors?.letter2?.message}
                      defaultValue={company.address?.letter2}
                    />
                    {errors?.letter2?.message && (
                      <Form.Control.Feedback type="invalid">
                        {msgErrors[errors.letter2.type]}
                      </Form.Control.Feedback>
                    )}
                  </Col>
                </Row>
              </Container>
            </Col>
            <Col>
              <Form.Label>* Nro. y Complemetos:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Numero, barrio, conjunto, etc."
                {...register("complement")}
                isInvalid={!!errors?.complement?.message}
                defaultValue={company.address?.complement}
              />
              {errors?.complement?.message && (
                <Form.Control.Feedback type="invalid">
                  {msgErrors[errors.complement.type]}
                </Form.Control.Feedback>
              )}
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Label>* Municipio:</Form.Label>
              <Select
                id="selectMunicipality"
                name="selectMunicipality"
                options={dbMunicipality}
                defaultInputValue={company.address.municipality}
                onChange={(value) => setMunicipalityValue(value.value)}
              />
              <input
                type="hidden"
                value={municipalityValue || ""}
                {...register("municipality")}
              />
            </Col>
            <Col>
              <Form.Label>* Telefono:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Sólo números"
                {...register("cellphone")}
                isInvalid={!!errors?.cellphone?.message}
                defaultValue={company.cellphone}
              />
              {errors?.cellphone?.message && (
                <Form.Control.Feedback type="invalid">
                  {msgErrors[errors.cellphone.type]}
                </Form.Control.Feedback>
              )}
            </Col>
          </Row>
          <br />
          <Row>
            <Col>
              <Form.Check
                type="checkbox"
                id="acceptsCellMsg"
                label="Acepto recibir mensajes por mensajes de texto al celular"
                defaultChecked={company.acceptsCellMsg}
                {...register("acceptsCellMsg")}
              />

              <Form.Check
                type="checkbox"
                id="acceptsEmailsMsg"
                label="Acepto recibir mensajes por correo electrónico"
                defaultChecked={company.acceptsEmailsMsg}
                {...register("acceptsEmailsMsg")}
              />
            </Col>
          </Row>
        </Container>
        <br />
        {msg !== "" && (
          <Alert
            className="alert-bottom"
            variant={error ? "danger" : "success"}
            onClose={() => setMsg("")}
            dismissible
          >
            {msg}
          </Alert>
        )}
        <Stack direction="horizontal" gap={3}>
          <Button variant="danger" type="submit" disabled={submitting}>
            {submitting ? "Cargando..." : "Continuar"}
          </Button>
          <Button variant="secondary" onClick={() => setCompany(null)}>
            Cancelar
          </Button>
        </Stack>
      </Form>
    </div>
  );
}

CompanyForm.propTypes = {
  company: PropTypes.object.isRequired,
  setCompany: PropTypes.func.isRequired,
};

export default CompanyForm;
