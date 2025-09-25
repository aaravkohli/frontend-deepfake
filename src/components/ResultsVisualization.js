import React from 'react';
import { Card, Row, Col, Badge, Table, ProgressBar, Alert } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, Cpu, FileText, Volume2, Image as ImageIcon, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { DetectionResult, FileType } from '../types/api';

function getResultIcon(result, size = 24) {
  switch (result) {
    case DetectionResult.REAL:
      return <CheckCircle size={size} className="text-success" />;
    case DetectionResult.FAKE:
      return <AlertCircle size={size} className="text-danger" />;
    case DetectionResult.UNCERTAIN:
      return <HelpCircle size={size} className="text-warning" />;
    default:
      return <HelpCircle size={size} className="text-secondary" />;
  }
}

function getResultColor(result) {
  switch (result) {
    case DetectionResult.REAL:
      return 'success';
    case DetectionResult.FAKE:
      return 'danger';
    case DetectionResult.UNCERTAIN:
      return 'warning';
    default:
      return 'secondary';
  }
}

function getFileTypeIcon(fileType, size = 20) {
  switch (fileType) {
    case FileType.AUDIO:
      return <Volume2 size={size} className="text-info" />;
    case FileType.IMAGE:
      return <ImageIcon size={size} className="text-success" />;
    case FileType.VIDEO:
      return <FileText size={size} className="text-warning" />;
    default:
      return <FileText size={size} className="text-secondary" />;
  }
}

export default function ResultsVisualization({ result, className = '' }) {
  const { detection_result, confidence_score, file_type, processing_time_ms, metadata, timestamp } = result;

  // Prepare probability data for visualization
  const probabilityData = React.useMemo(() => {
    if (!metadata) return [];

    const data = [];

    // For audio files with detailed probability breakdown
    if (metadata.prob_fake !== undefined && metadata.prob_real !== undefined) {
      data.push(
        { name: 'Real', value: metadata.prob_real * 100, color: '#28a745' },
        { name: 'Fake', value: metadata.prob_fake * 100, color: '#dc3545' }
      );
    }
    // For image files
    else if (metadata.real_probability !== undefined && metadata.fake_probability !== undefined) {
      data.push(
        { name: 'Real', value: metadata.real_probability * 100, color: '#28a745' },
        { name: 'Fake', value: metadata.fake_probability * 100, color: '#dc3545' }
      );
    }
    // Fallback to confidence score
    else {
      const realProb = detection_result === DetectionResult.REAL ? confidence_score * 100 : (1 - confidence_score) * 100;
      const fakeProb = 100 - realProb;
      data.push(
        { name: 'Real', value: realProb, color: '#28a745' },
        { name: 'Fake', value: fakeProb, color: '#dc3545' }
      );
    }

    return data;
  }, [metadata, confidence_score, detection_result]);

  // Prepare technical details for audio models
  const audioTechnicalData = React.useMemo(() => {
    if (!metadata || file_type !== FileType.AUDIO) return [];

    return [
      { name: 'Raw Logit', value: metadata.raw_logit || 0 },
      { name: 'Sigmoid Output', value: metadata.sigmoid_output || 0 },
      { name: 'Threshold', value: metadata.threshold || 0.5 },
    ];
  }, [metadata, file_type]);

  return (
    <div className={`results-visualization ${className}`}>
      {/* Main Result Header */}
      <Card className="bg-card border-subtle shadow mb-4">
        <Card.Body>
          <div className="text-center p-4">
            {getResultIcon(detection_result, 64)}
            <h2 className={`text-${getResultColor(detection_result)} mt-3 mb-2`}>
              {detection_result.toUpperCase()}
            </h2>
            <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
              <Badge bg={getResultColor(detection_result)} className="fs-6 px-3 py-2">
                {(confidence_score * 100).toFixed(1)}% Confidence
              </Badge>
              <Badge bg="secondary" className="fs-6 px-3 py-2">
                {getFileTypeIcon(file_type, 16)}
                <span className="ms-2">{file_type.toUpperCase()}</span>
              </Badge>
            </div>
            <div className="text-muted">
              <Clock size={16} className="me-1" />
              Processed in {processing_time_ms.toFixed(0)}ms
            </div>
          </div>
        </Card.Body>
      </Card>

      <Row>
        {/* Probability Breakdown */}
        <Col lg={6} className="mb-4">
          <Card className="bg-card border-subtle shadow h-100">
            <Card.Header>
              <Card.Title className="text-heading mb-0">Probability Analysis</Card.Title>
            </Card.Header>
            <Card.Body>
              {probabilityData.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={probabilityData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    >
                      {probabilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Probability']} />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {/* Confidence Progress Bar */}
              <div className="mt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Overall Confidence</span>
                  <span className="text-heading">{(confidence_score * 100).toFixed(1)}%</span>
                </div>
                <ProgressBar 
                  now={confidence_score * 100} 
                  variant={getResultColor(detection_result)}
                  style={{ height: '8px' }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Technical Details */}
        <Col lg={6} className="mb-4">
          <Card className="bg-card border-subtle shadow h-100">
            <Card.Header>
              <Card.Title className="text-heading mb-0">
                <Cpu size={18} className="me-2" />
                Technical Details
              </Card.Title>
            </Card.Header>
            <Card.Body>
              <Table responsive className="table-dark">
                <tbody>
                  <tr>
                    <td className="text-muted">Model Architecture</td>
                    <td className="text-heading">{metadata?.model_architecture || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Processing Device</td>
                    <td className="text-heading">{metadata?.device || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Backend</td>
                    <td className="text-heading">{metadata?.backend || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">File Hash</td>
                    <td className="text-heading font-monospace small">{result.file_hash.substring(0, 16)}...</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Timestamp</td>
                    <td className="text-heading">{new Date(timestamp).toLocaleString()}</td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Audio-Specific Analysis */}
      {file_type === FileType.AUDIO && metadata && (
        <Row>
          <Col lg={6} className="mb-4">
            <Card className="bg-card border-subtle shadow">
              <Card.Header>
                <Card.Title className="text-heading mb-0">
                  <Volume2 size={18} className="me-2" />
                  Audio Analysis Details
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <Table responsive className="table-dark">
                  <tbody>
                    <tr>
                      <td className="text-muted">Original Duration</td>
                      <td className="text-heading">
                        {metadata.original_duration_seconds?.toFixed(2)}s
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted">Original Sample Rate</td>
                      <td className="text-heading">{metadata.original_sample_rate}Hz</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Processed Sample Rate</td>
                      <td className="text-heading">{metadata.processed_sample_rate}Hz</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Original Channels</td>
                      <td className="text-heading">{metadata.original_channels}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Threshold Used</td>
                      <td className="text-heading">{metadata.threshold}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Interpretation Flipped</td>
                      <td className="text-heading">
                        {metadata.interpretation_flipped ? 'Yes' : 'No'}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6} className="mb-4">
            <Card className="bg-card border-subtle shadow">
              <Card.Header>
                <Card.Title className="text-heading mb-0">Raw Model Outputs</Card.Title>
              </Card.Header>
              <Card.Body>
                {audioTechnicalData.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={audioTechnicalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [Number(value).toFixed(4), 'Value']}
                      />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {metadata.is_uncertain && (
                  <Alert variant="warning" className="mt-3">
                    <AlertCircle size={16} className="me-2" />
                    <strong>Uncertain Result:</strong> This prediction falls within the uncertainty range 
                    [{metadata.uncertainty_bounds?.[0]?.toFixed(3)}, {metadata.uncertainty_bounds?.[1]?.toFixed(3)}].
                    Consider manual review.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Image-Specific Analysis */}
      {file_type === FileType.IMAGE && metadata && (
        <Row>
          <Col lg={6} className="mb-4">
            <Card className="bg-card border-subtle shadow">
              <Card.Header>
                <Card.Title className="text-heading mb-0">
                  <ImageIcon size={18} className="me-2" />
                  Image Analysis Details
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <Table responsive className="table-dark">
                  <tbody>
                    <tr>
                      <td className="text-muted">Original Resolution</td>
                      <td className="text-heading">{metadata.original_resolution}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Input Resolution</td>
                      <td className="text-heading">{metadata.input_resolution}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Image Format</td>
                      <td className="text-heading">{metadata.format}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Predicted Class</td>
                      <td className="text-heading">
                        {metadata.predicted_class === 1 ? 'Real (1)' : 'Fake (0)'}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          {metadata.raw_outputs && (
            <Col lg={6} className="mb-4">
              <Card className="bg-card border-subtle shadow">
                <Card.Header>
                  <Card.Title className="text-heading mb-0">Raw Model Logits</Card.Title>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { name: 'Fake Logit', value: metadata.raw_outputs.fake_logit },
                      { name: 'Real Logit', value: metadata.raw_outputs.real_logit }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [Number(value).toFixed(4), 'Logit']}
                      />
                      <Bar dataKey="value" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      )}
    </div>
  );
}