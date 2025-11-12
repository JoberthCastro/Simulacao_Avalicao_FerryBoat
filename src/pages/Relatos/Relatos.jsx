import { useState } from 'react';
import { useFerry } from '../../context/FerryContext';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Button from '../../components/Button/Button';
import './Relatos.css';

function Relatos() {
  const { addReport } = useFerry();
  const [formData, setFormData] = useState({
    type: 'fila',
    description: '',
    location: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const reportTypes = [
    { value: 'fila', label: 'Fila Exagerada' },
    { value: 'problema', label: 'Problema Técnico' },
    { value: 'sugestao', label: 'Sugestão' },
    { value: 'outro', label: 'Outro' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addReport(formData);
    setSubmitted(true);
    setFormData({
      type: 'fila',
      description: '',
      location: ''
    });
  };

  return (
    <div className="relatos">
      <h1>Canal de Relatos</h1>
      <p className="page-subtitle">
        Compartilhe sua experiência e ajude a melhorar o serviço
      </p>

      <div className="relatos-grid">
        <Card title="Enviar Relato">
          <form onSubmit={handleSubmit} className="report-form">
            <Select
              label="Tipo de Relato"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              options={reportTypes}
              required
            />

            <Input
              label="Localização (opcional)"
              type="text"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Ex: Terminal da Ilha"
            />

            <div className="textarea-group">
              <label className="textarea-label">
                Descrição
                <span className="required">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descreva o problema, sugestão ou observação..."
                required
                rows="6"
                className="textarea"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="submit-button"
              disabled={!formData.description.trim()}
            >
              Enviar Relato
            </Button>

            {submitted && (
              <div className="success-message">
                ✅ Relato enviado com sucesso! Obrigado pelo feedback.
              </div>
            )}
          </form>
        </Card>

        <Card title="Tipos de Relatos">
          <div className="info-section">
            <div className="report-type-info">
              <h3>🚗 Fila Exagerada</h3>
              <p>Reporte quando a fila estiver muito longa ou demorada</p>
            </div>

            <div className="report-type-info">
              <h3>⚠️ Problema Técnico</h3>
              <p>Informe sobre problemas técnicos ou operacionais</p>
            </div>

            <div className="report-type-info">
              <h3>💡 Sugestão</h3>
              <p>Compartilhe ideias para melhorar o serviço</p>
            </div>

            <div className="report-type-info">
              <h3>📝 Outro</h3>
              <p>Qualquer outra observação ou feedback</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Relatos;

