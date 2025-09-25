import React from 'react';
import { Card, Form, Row, Col, Badge, Alert, Button, Accordion } from 'react-bootstrap';
import { Volume2, Settings, RotateCcw, Info, AlertTriangle } from 'lucide-react';
import { useAudioCalibration } from '../hooks/useApi';

const THRESHOLD_PRESETS = [
  { name: 'Conservative', value: 0.65, description: 'Fewer false positives, may miss some fakes' },
  { name: 'Balanced', value: 0.5, description: 'Standard threshold for most use cases' },
  { name: 'Sensitive', value: 0.35, description: 'Catch more fakes, higher false positive rate' },
];

const UNCERTAINTY_PRESETS = [
  { name: 'Narrow', value: 0.05, description: 'Only very close predictions marked uncertain' },
  { name: 'Standard', value: 0.1, description: 'Default uncertainty range' },
  { name: 'Wide', value: 0.2, description: 'More predictions marked uncertain for review' },
];

export default function AudioCalibration({
  className = '',
  onConfigChange,
  showAdvanced = false
}) {
  const { config, setConfig, resetConfig } = useAudioCalibration();

  const handleConfigUpdate = (updates) => {
    const newConfig = { ...config, ...updates };
    setConfig(updates);
    if (onConfigChange) {
      onConfigChange(newConfig);
    }
  };

  const applyPreset = (type, value) => {
    const updates = type === 'threshold' 
      ? { threshold: value }
      : { uncertainty_range: value };
    handleConfigUpdate(updates);
  };

  const handleReset = () => {
    resetConfig();
    if (onConfigChange) {
      onConfigChange({
        flip_output_interpretation: false,
        threshold: 0.5,
        uncertainty_range: 0.1
      });
    }
  };

  return (
    <div className={`audio-calibration ${className}`}>
      <Card className="bg-card border-subtle shadow">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Volume2 size={20} className="text-info me-2" />
              <Card.Title className="text-heading mb-0">Audio Model Calibration</Card.Title>
            </div>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={handleReset}
              title="Reset to defaults"
            >
              <RotateCcw size={16} className="me-1" />
              Reset
            </Button>
          </div>
        </Card.Header>

        <Card.Body>
          <Alert variant="info" className="d-flex align-items-start">
            <Info size={16} className="me-2 mt-1 flex-shrink-0" />
            <div>
              <strong>Audio Model Calibration</strong><br />
              These settings control how the RawNetLite audio model interprets results and handles uncertainty.
              Adjusting these parameters can improve accuracy for your specific use case.
            </div>
          </Alert>

          <Form>
            {/* Output Interpretation Toggle */}
            <Row className="mb-4">
              <Col>
                <Form.Group>
                  <Form.Label className="text-heading d-flex align-items-center mb-2">
                    <Settings size={16} className="me-2" />
                    Output Interpretation
                  </Form.Label>
                  <div className="d-flex align-items-center mb-2">
                    <Form.Check
                      type="switch"
                      id="flip-interpretation"
                      checked={config.flip_output_interpretation || false}
                      onChange={(e) => handleConfigUpdate({ flip_output_interpretation: e.target.checked })}
                      className="me-3"
                    />
                    <Badge bg={config.flip_output_interpretation ? "warning" : "info"} className="me-2">
                      {config.flip_output_interpretation ? "Flipped" : "Normal"}
                    </Badge>
                    <span className="text-muted small">
                      {config.flip_output_interpretation 
                        ? "Sigmoid output interpreted as 'real' probability" 
                        : "Sigmoid output interpreted as 'fake' probability"}
                    </span>
                  </div>
                  <Form.Text className="text-muted">
                    Toggle this if the model seems to consistently give inverted results. 
                    This can happen with different training configurations.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Detection Threshold */}
            <Row className="mb-4">
              <Col>
                <Form.Group>
                  <Form.Label className="text-heading mb-2">
                    Detection Threshold
                    <Badge bg="primary" className="ms-2">{(config.threshold || 0.5).toFixed(2)}</Badge>
                  </Form.Label>
                  <Form.Range
                    min={0.1}
                    max={0.9}
                    step={0.01}
                    value={config.threshold || 0.5}
                    onChange={(e) => handleConfigUpdate({ threshold: parseFloat(e.target.value) })}
                    className="mb-3"
                  />
                  <div className="d-flex justify-content-between text-muted small mb-3">
                    <span>0.1 (Very Sensitive)</span>
                    <span>0.5 (Balanced)</span>
                    <span>0.9 (Very Conservative)</span>
                  </div>
                  
                  <div className="d-flex gap-2 mb-2">
                    {THRESHOLD_PRESETS.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline-primary"
                        size="sm"
                        onClick={() => applyPreset('threshold', preset.value)}
                        className={config.threshold === preset.value ? 'active' : ''}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                  
                  <Form.Text className="text-muted">
                    Lower values catch more fakes but increase false positives. 
                    Higher values are more conservative but may miss subtle fakes.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Uncertainty Range */}
            <Row className="mb-4">
              <Col>
                <Form.Group>
                  <Form.Label className="text-heading mb-2">
                    Uncertainty Range
                    <Badge bg="warning" className="ms-2">±{((config.uncertainty_range || 0.1) / 2).toFixed(2)}</Badge>
                  </Form.Label>
                  <Form.Range
                    min={0.01}
                    max={0.3}
                    step={0.01}
                    value={config.uncertainty_range || 0.1}
                    onChange={(e) => handleConfigUpdate({ uncertainty_range: parseFloat(e.target.value) })}
                    className="mb-3"
                  />
                  <div className="d-flex justify-content-between text-muted small mb-3">
                    <span>0.01 (Narrow)</span>
                    <span>0.1 (Standard)</span>
                    <span>0.3 (Wide)</span>
                  </div>
                  
                  <div className="d-flex gap-2 mb-2">
                    {UNCERTAINTY_PRESETS.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline-warning"
                        size="sm"
                        onClick={() => applyPreset('uncertainty', preset.value)}
                        className={config.uncertainty_range === preset.value ? 'active' : ''}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                  
                  <Form.Text className="text-muted">
                    Predictions within this range around 0.5 will be marked as "uncertain" for manual review.
                    Current range: [{((0.5 - (config.uncertainty_range || 0.1) / 2)).toFixed(2)}, {((0.5 + (config.uncertainty_range || 0.1) / 2)).toFixed(2)}]
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Current Configuration Summary */}
            <Alert variant="secondary" className="mb-0">
              <div className="d-flex align-items-center mb-2">
                <Settings size={16} className="me-2" />
                <strong>Current Configuration</strong>
              </div>
              <Row>
                <Col md={4}>
                  <div className="text-muted small">Interpretation</div>
                  <div className={`fw-bold ${config.flip_output_interpretation ? 'text-warning' : 'text-info'}`}>
                    {config.flip_output_interpretation ? 'Flipped' : 'Normal'}
                  </div>
                </Col>
                <Col md={4}>
                  <div className="text-muted small">Threshold</div>
                  <div className="fw-bold text-primary">{(config.threshold || 0.5).toFixed(2)}</div>
                </Col>
                <Col md={4}>
                  <div className="text-muted small">Uncertainty Range</div>
                  <div className="fw-bold text-warning">±{((config.uncertainty_range || 0.1) / 2).toFixed(2)}</div>
                </Col>
              </Row>
            </Alert>
          </Form>

          {/* Advanced Settings */}
          {showAdvanced && (
            <Accordion className="mt-4">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <AlertTriangle size={16} className="me-2" />
                  Advanced Configuration Notes
                </Accordion.Header>
                <Accordion.Body>
                  <div className="text-muted">
                    <h6 className="text-heading">Troubleshooting Guide:</h6>
                    <ul>
                      <li>
                        <strong>Model consistently wrong:</strong> Try toggling the output interpretation. 
                        Some models have inverted sigmoid mapping.
                      </li>
                      <li>
                        <strong>Too many false positives:</strong> Increase the threshold or enable conservative mode.
                      </li>
                      <li>
                        <strong>Missing obvious fakes:</strong> Decrease the threshold or enable sensitive mode.
                      </li>
                      <li>
                        <strong>Borderline predictions:</strong> Increase uncertainty range to flag more cases for manual review.
                      </li>
                    </ul>
                    
                    <h6 className="text-heading mt-3">Model Architecture:</h6>
                    <p>
                      The audio model uses RawNetLite architecture with 1D convolutions, residual blocks, 
                      and bidirectional GRU. It processes 3-second audio segments at 16kHz sample rate.
                    </p>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}