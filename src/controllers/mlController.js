const mlService = require('../services/mlService');

class MLController {
  getDatasets(req, res, next) {
    try {
      const datasets = mlService.getDatasets();
      res.json(datasets);
    } catch (err) {
      next(err);
    }
  }

  getModels(req, res, next) {
    try {
      const models = mlService.getModels();
      res.json(models);
    } catch (err) {
      next(err);
    }
  }

  getFederatedStatus(req, res, next) {
    try {
      const status = mlService.getFederatedStatus();
      res.json(status);
    } catch (err) {
      next(err);
    }
  }

  getClinicalPresets(req, res, next) {
    mlService.forwardToFastAPI('/api/clinical/presets', 'GET', null, res, () => {
      res.json({
        presets: [
          {
            id: 'case_neuro_manifestation',
            title: 'Severe Neurological Presentation (Phenotype 1)',
            description: 'Patient with basal ganglia & brainstem involvement, psychiatric score 7.0.',
            features: {
              'lenticular nucleus damage  (es/No)': 1.0,
              'Brainstem damage(es/No)': 1.0,
              'Thalamus damage (es/No)': 1.0,
              'Psychiatric symptom score': 7.0,
              'Age': 29.0,
              'Cr': 67.7,
              'TT': 16.9,
              'K-F ring(es/No)': 1.0,
              'CP': 0.018
            }
          },
          {
            id: 'case_hepatic_asymptomatic',
            title: 'Hepatic / Neuro-Asymptomatic (Phenotype 0)',
            description: 'Patient with hepatic presentation, intact imaging, psychiatric score 1.0.',
            features: {
              'lenticular nucleus damage  (es/No)': 0.0,
              'Brainstem damage(es/No)': 0.0,
              'Thalamus damage (es/No)': 0.0,
              'Psychiatric symptom score': 1.0,
              'Age': 19.0,
              'Cr': 79.1,
              'TT': 17.0,
              'K-F ring(es/No)': 1.0,
              'CP': 0.043
            }
          }
        ]
      });
    });
  }

  predictClinical(req, res, next) {
    mlService.forwardToFastAPI('/api/predict/clinical', 'POST', req.body, res, null);
  }
}

module.exports = new MLController();
