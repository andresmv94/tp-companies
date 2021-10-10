import { useState } from "react";
import CheckCompany from "./CheckCompany";
import CompanyForm from "./CompanyForm";
import { Col, Row } from "react-bootstrap";

export default function Content() {
  const [company, setCompany] = useState();
  return (
    <Row>
      {company ? (
        <Col xs={12} md={{ span: 8, offset: 2 }}>
          <CompanyForm company={company} setCompany={setCompany} />
        </Col>
      ) : (
        <Col xs={12} md={{ span: 6, offset: 3 }}>
          <CheckCompany setCompany={setCompany} />
        </Col>
      )}
    </Row>
  );
}
