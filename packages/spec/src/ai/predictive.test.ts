import { describe, it, expect } from 'vitest';
import {
  PredictiveModelSchema,
  PredictiveModelTypeSchema,
  ModelFeatureSchema,
  HyperparametersSchema,
  TrainingConfigSchema,
  EvaluationMetricsSchema,
  PredictionRequestSchema,
  PredictionResultSchema,
  ModelDriftSchema,
  type PredictiveModel,
  type ModelFeature,
  type PredictionRequest,
} from './predictive.zod';

describe('PredictiveModelTypeSchema', () => {
  it('should accept all model types', () => {
    const types = [
      'classification',
      'regression',
      'clustering',
      'forecasting',
      'anomaly_detection',
      'recommendation',
      'ranking',
    ] as const;

    types.forEach(type => {
      expect(() => PredictiveModelTypeSchema.parse(type)).not.toThrow();
    });
  });
});

describe('ModelFeatureSchema', () => {
  it('should accept minimal feature', () => {
    const feature: ModelFeature = {
      name: 'user_age',
      field: 'age',
      dataType: 'numeric',
    };

    const result = ModelFeatureSchema.parse(feature);
    expect(result.transformation).toBe('none');
    expect(result.required).toBe(true);
  });

  it('should enforce snake_case for feature name', () => {
    const validNames = ['user_age', 'total_revenue', '_internal_score'];
    validNames.forEach(name => {
      expect(() => ModelFeatureSchema.parse({
        name,
        field: 'test',
        dataType: 'numeric',
      })).not.toThrow();
    });

    const invalidNames = ['userAge', 'User-Age', '123age'];
    invalidNames.forEach(name => {
      expect(() => ModelFeatureSchema.parse({
        name,
        field: 'test',
        dataType: 'numeric',
      })).toThrow();
    });
  });

  it('should accept feature with transformation', () => {
    const feature: ModelFeature = {
      name: 'normalized_revenue',
      field: 'annual_revenue',
      dataType: 'numeric',
      transformation: 'normalize',
      label: 'Normalized Annual Revenue',
    };

    expect(() => ModelFeatureSchema.parse(feature)).not.toThrow();
  });

  it('should accept categorical feature', () => {
    const feature: ModelFeature = {
      name: 'industry_encoded',
      field: 'industry',
      dataType: 'categorical',
      transformation: 'one_hot_encode',
      description: 'Industry category with one-hot encoding',
    };

    expect(() => ModelFeatureSchema.parse(feature)).not.toThrow();
  });

  it('should accept feature from related object', () => {
    const feature: ModelFeature = {
      name: 'account_revenue',
      field: 'annual_revenue',
      object: 'account',
      dataType: 'numeric',
      transformation: 'log_transform',
    };

    expect(() => ModelFeatureSchema.parse(feature)).not.toThrow();
  });
});

describe('HyperparametersSchema', () => {
  it('should accept empty hyperparameters', () => {
    const params = {};
    expect(() => HyperparametersSchema.parse(params)).not.toThrow();
  });

  it('should accept general training parameters', () => {
    const params = {
      learningRate: 0.001,
      epochs: 100,
      batchSize: 32,
    };

    expect(() => HyperparametersSchema.parse(params)).not.toThrow();
  });

  it('should accept tree-based model parameters', () => {
    const params = {
      maxDepth: 10,
      numTrees: 100,
      minSamplesSplit: 2,
      minSamplesLeaf: 1,
    };

    expect(() => HyperparametersSchema.parse(params)).not.toThrow();
  });

  it('should accept neural network parameters', () => {
    const params = {
      hiddenLayers: [128, 64, 32],
      activation: 'relu',
      dropout: 0.2,
      learningRate: 0.001,
    };

    expect(() => HyperparametersSchema.parse(params)).not.toThrow();
  });

  it('should accept clustering parameters', () => {
    const params = {
      numClusters: 5,
    };

    expect(() => HyperparametersSchema.parse(params)).not.toThrow();
  });

  it('should accept custom parameters', () => {
    const params = {
      maxDepth: 5,
      custom: {
        subsample: 0.8,
        colsampleByTree: 0.8,
        gamma: 0.1,
      },
    };

    expect(() => HyperparametersSchema.parse(params)).not.toThrow();
  });
});

describe('TrainingConfigSchema', () => {
  it('should accept minimal training config', () => {
    const config = {};
    const result = TrainingConfigSchema.parse(config);
    
    expect(result.trainingDataRatio).toBe(0.8);
    expect(result.validationDataRatio).toBe(0.1);
    expect(result.testDataRatio).toBe(0.1);
    expect(result.strategy).toBe('full');
    expect(result.crossValidation).toBe(true);
    expect(result.folds).toBe(5);
    expect(result.earlyStoppingEnabled).toBe(true);
    expect(result.earlyStoppingPatience).toBe(10);
    expect(result.gpuEnabled).toBe(false);
  });

  it('should accept custom data split', () => {
    const config = {
      trainingDataRatio: 0.7,
      validationDataRatio: 0.15,
      testDataRatio: 0.15,
    };

    expect(() => TrainingConfigSchema.parse(config)).not.toThrow();
  });

  it('should enforce data ratio constraints', () => {
    expect(() => TrainingConfigSchema.parse({
      trainingDataRatio: 1.5,
    })).toThrow();

    expect(() => TrainingConfigSchema.parse({
      trainingDataRatio: -0.1,
    })).toThrow();
  });

  it('should accept training with data filter', () => {
    const config = {
      dataFilter: 'created_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)',
      minRecords: 1000,
      maxRecords: 100000,
    };

    expect(() => TrainingConfigSchema.parse(config)).not.toThrow();
  });

  it('should accept incremental learning config', () => {
    const config = {
      strategy: 'incremental' as const,
      maxTrainingTime: 3600,
      randomSeed: 42,
    };

    expect(() => TrainingConfigSchema.parse(config)).not.toThrow();
  });

  it('should enforce fold constraints', () => {
    expect(() => TrainingConfigSchema.parse({
      folds: 1,
    })).toThrow();

    expect(() => TrainingConfigSchema.parse({
      folds: 11,
    })).toThrow();

    expect(() => TrainingConfigSchema.parse({
      folds: 5,
    })).not.toThrow();
  });
});

describe('EvaluationMetricsSchema', () => {
  it('should accept classification metrics', () => {
    const metrics = {
      accuracy: 0.92,
      precision: 0.89,
      recall: 0.91,
      f1Score: 0.90,
      auc: 0.95,
    };

    expect(() => EvaluationMetricsSchema.parse(metrics)).not.toThrow();
  });

  it('should accept regression metrics', () => {
    const metrics = {
      mse: 0.045,
      rmse: 0.212,
      mae: 0.18,
      r2Score: 0.87,
    };

    expect(() => EvaluationMetricsSchema.parse(metrics)).not.toThrow();
  });

  it('should accept clustering metrics', () => {
    const metrics = {
      silhouetteScore: 0.65,
      daviesBouldinIndex: 0.42,
    };

    expect(() => EvaluationMetricsSchema.parse(metrics)).not.toThrow();
  });

  it('should accept custom metrics', () => {
    const metrics = {
      accuracy: 0.88,
      custom: {
        topKAccuracy: 0.95,
        meanReciprocalRank: 0.82,
      },
    };

    expect(() => EvaluationMetricsSchema.parse(metrics)).not.toThrow();
  });
});

describe('PredictiveModelSchema', () => {
  describe('Basic Properties', () => {
    it('should accept minimal model', () => {
      const model: PredictiveModel = {
        name: 'lead_scoring_model',
        label: 'Lead Scoring Model',
        type: 'classification',
        objectName: 'lead',
        target: 'converted',
        features: [
          {
            name: 'engagement_score',
            field: 'engagement_score',
            dataType: 'numeric',
          },
        ],
      };

      const result = PredictiveModelSchema.parse(model);
      expect(result.deploymentStatus).toBe('draft');
      expect(result.version).toBe('1.0.0');
      expect(result.updateTrigger).toBe('on_create');
      expect(result.autoRetrain).toBe(false);
      expect(result.enableExplainability).toBe(false);
      expect(result.enableMonitoring).toBe(true);
      expect(result.alertOnDrift).toBe(true);
      expect(result.active).toBe(true);
    });

    it('should enforce snake_case for model name', () => {
      const validNames = ['lead_scoring', 'churn_prediction', '_experimental_model'];
      validNames.forEach(name => {
        expect(() => PredictiveModelSchema.parse({
          name,
          label: 'Test',
          type: 'classification',
          objectName: 'test',
          target: 'outcome',
          features: [{
            name: 'feature1',
            field: 'field1',
            dataType: 'numeric',
          }],
        })).not.toThrow();
      });

      const invalidNames = ['leadScoring', 'Lead-Scoring', '123model'];
      invalidNames.forEach(name => {
        expect(() => PredictiveModelSchema.parse({
          name,
          label: 'Test',
          type: 'classification',
          objectName: 'test',
          target: 'outcome',
          features: [{
            name: 'feature1',
            field: 'field1',
            dataType: 'numeric',
          }],
        })).toThrow();
      });
    });
  });

  describe('Classification Models', () => {
    it('should accept binary classification model', () => {
      const model: PredictiveModel = {
        name: 'churn_predictor',
        label: 'Customer Churn Predictor',
        description: 'Predicts likelihood of customer churn',
        type: 'classification',
        algorithm: 'random_forest',
        objectName: 'customer',
        target: 'churned',
        targetType: 'binary',
        features: [
          {
            name: 'account_age',
            field: 'created_date',
            dataType: 'datetime',
            transformation: 'none',
          },
          {
            name: 'total_spend',
            field: 'lifetime_value',
            dataType: 'numeric',
            transformation: 'log_transform',
          },
          {
            name: 'support_tickets',
            field: 'ticket_count',
            dataType: 'numeric',
          },
        ],
        hyperparameters: {
          numTrees: 100,
          maxDepth: 10,
          minSamplesSplit: 5,
        },
        training: {
          trainingDataRatio: 0.7,
          validationDataRatio: 0.15,
          testDataRatio: 0.15,
          crossValidation: true,
          folds: 5,
        },
        metrics: {
          accuracy: 0.89,
          precision: 0.85,
          recall: 0.92,
          f1Score: 0.88,
          auc: 0.94,
        },
        deploymentStatus: 'deployed',
        predictionField: 'churn_probability',
        confidenceField: 'prediction_confidence',
        updateTrigger: 'on_update',
      };

      expect(() => PredictiveModelSchema.parse(model)).not.toThrow();
    });

    it('should accept multi-class classification model', () => {
      const model: PredictiveModel = {
        name: 'lead_quality_classifier',
        label: 'Lead Quality Classifier',
        type: 'classification',
        algorithm: 'xgboost',
        objectName: 'lead',
        target: 'quality_tier',
        targetType: 'categorical',
        features: [
          {
            name: 'company_size',
            field: 'employee_count',
            dataType: 'numeric',
            transformation: 'binning',
          },
          {
            name: 'industry',
            field: 'industry',
            dataType: 'categorical',
            transformation: 'one_hot_encode',
          },
          {
            name: 'engagement',
            field: 'engagement_score',
            dataType: 'numeric',
            transformation: 'standardize',
          },
        ],
      };

      expect(() => PredictiveModelSchema.parse(model)).not.toThrow();
    });
  });

  describe('Regression Models', () => {
    it('should accept regression model', () => {
      const model: PredictiveModel = {
        name: 'revenue_forecaster',
        label: 'Monthly Revenue Forecaster',
        type: 'regression',
        algorithm: 'linear_regression',
        objectName: 'opportunity',
        target: 'amount',
        targetType: 'numeric',
        features: [
          {
            name: 'deal_size',
            field: 'estimated_value',
            dataType: 'numeric',
            transformation: 'normalize',
          },
          {
            name: 'sales_cycle',
            field: 'days_in_pipeline',
            dataType: 'numeric',
          },
          {
            name: 'product_count',
            field: 'num_products',
            dataType: 'numeric',
          },
        ],
        hyperparameters: {
          l2Regularization: 0.01,
        },
        training: {
          minRecords: 500,
          strategy: 'full',
        },
        metrics: {
          rmse: 1250.5,
          mae: 980.2,
          r2Score: 0.85,
        },
      };

      expect(() => PredictiveModelSchema.parse(model)).not.toThrow();
    });
  });

  describe('Time Series Models', () => {
    it('should accept forecasting model', () => {
      const model: PredictiveModel = {
        name: 'sales_forecaster',
        label: 'Sales Forecasting Model',
        type: 'forecasting',
        algorithm: 'lstm',
        objectName: 'sales_data',
        target: 'monthly_revenue',
        features: [
          {
            name: 'historical_revenue',
            field: 'revenue',
            dataType: 'numeric',
          },
          {
            name: 'seasonality',
            field: 'month',
            dataType: 'categorical',
          },
        ],
        hyperparameters: {
          seasonalPeriod: 12,
          forecastHorizon: 3,
          hiddenLayers: [64, 32],
          learningRate: 0.001,
        },
        metrics: {
          mape: 0.08,
          smape: 0.075,
        },
      };

      expect(() => PredictiveModelSchema.parse(model)).not.toThrow();
    });
  });

  describe('Clustering Models', () => {
    it('should accept clustering model', () => {
      const model: PredictiveModel = {
        name: 'customer_segmentation',
        label: 'Customer Segmentation Model',
        type: 'clustering',
        algorithm: 'kmeans',
        objectName: 'customer',
        target: 'segment',
        features: [
          {
            name: 'total_purchases',
            field: 'purchase_count',
            dataType: 'numeric',
            transformation: 'normalize',
          },
          {
            name: 'avg_order_value',
            field: 'average_order',
            dataType: 'numeric',
            transformation: 'normalize',
          },
          {
            name: 'recency',
            field: 'last_purchase_date',
            dataType: 'datetime',
          },
        ],
        hyperparameters: {
          numClusters: 5,
        },
        metrics: {
          silhouetteScore: 0.68,
        },
      };

      expect(() => PredictiveModelSchema.parse(model)).not.toThrow();
    });
  });

  describe('Advanced Features', () => {
    it('should accept model with auto-retraining', () => {
      const model: PredictiveModel = {
        name: 'auto_retrain_model',
        label: 'Auto-Retrain Model',
        type: 'classification',
        objectName: 'lead',
        target: 'converted',
        features: [
          { name: 'score', field: 'score', dataType: 'numeric' },
        ],
        autoRetrain: true,
        retrainSchedule: '0 2 * * 0',
        retrainThreshold: 0.05,
      };

      expect(() => PredictiveModelSchema.parse(model)).not.toThrow();
    });

    it('should accept model with explainability', () => {
      const model: PredictiveModel = {
        name: 'explainable_model',
        label: 'Explainable Prediction Model',
        type: 'classification',
        objectName: 'loan_application',
        target: 'approved',
        features: [
          { name: 'credit_score', field: 'credit_score', dataType: 'numeric' },
          { name: 'income', field: 'annual_income', dataType: 'numeric' },
        ],
        enableExplainability: true,
      };

      expect(() => PredictiveModelSchema.parse(model)).not.toThrow();
    });

    it('should accept complete model with all features', () => {
      const model: PredictiveModel = {
        name: 'comprehensive_ml_model',
        label: 'Comprehensive ML Model',
        description: 'Full-featured predictive model',
        type: 'classification',
        algorithm: 'neural_network',
        objectName: 'opportunity',
        target: 'will_close',
        targetType: 'binary',
        features: [
          {
            name: 'deal_value',
            label: 'Deal Value',
            field: 'amount',
            dataType: 'numeric',
            transformation: 'normalize',
            required: true,
            description: 'Opportunity amount',
            importance: 0.85,
          },
          {
            name: 'stage_duration',
            field: 'days_in_stage',
            dataType: 'numeric',
            transformation: 'log_transform',
            importance: 0.72,
          },
        ],
        hyperparameters: {
          learningRate: 0.001,
          epochs: 100,
          batchSize: 32,
          hiddenLayers: [128, 64, 32],
          activation: 'relu',
          dropout: 0.2,
          l2Regularization: 0.001,
        },
        training: {
          trainingDataRatio: 0.7,
          validationDataRatio: 0.15,
          testDataRatio: 0.15,
          dataFilter: 'created_date >= "2023-01-01"',
          minRecords: 1000,
          strategy: 'incremental',
          crossValidation: true,
          folds: 5,
          earlyStoppingEnabled: true,
          earlyStoppingPatience: 15,
          maxTrainingTime: 7200,
          gpuEnabled: true,
          randomSeed: 42,
        },
        metrics: {
          accuracy: 0.91,
          precision: 0.88,
          recall: 0.93,
          f1Score: 0.90,
          auc: 0.96,
        },
        deploymentStatus: 'deployed',
        version: '2.1.0',
        predictionField: 'predicted_close_probability',
        confidenceField: 'prediction_confidence',
        updateTrigger: 'on_update',
        autoRetrain: true,
        retrainSchedule: '0 3 * * 0',
        retrainThreshold: 0.05,
        enableExplainability: true,
        enableMonitoring: true,
        alertOnDrift: true,
        active: true,
        owner: 'data_science_team',
        permissions: ['sales_team', 'analytics_team'],
        tags: ['sales', 'ml', 'production'],
        category: 'sales',
        lastTrainedAt: '2024-01-15T03:00:00Z',
        createdAt: '2023-06-01T10:00:00Z',
        updatedAt: '2024-01-15T03:30:00Z',
      };

      expect(() => PredictiveModelSchema.parse(model)).not.toThrow();
    });
  });
});

describe('PredictionRequestSchema', () => {
  it('should accept minimal prediction request', () => {
    const request: PredictionRequest = {
      modelName: 'lead_scoring_model',
    };

    const result = PredictionRequestSchema.parse(request);
    expect(result.returnConfidence).toBe(true);
    expect(result.returnExplanation).toBe(false);
  });

  it('should accept request with record IDs', () => {
    const request: PredictionRequest = {
      modelName: 'churn_predictor',
      recordIds: ['cust_1', 'cust_2', 'cust_3'],
      returnExplanation: true,
    };

    expect(() => PredictionRequestSchema.parse(request)).not.toThrow();
  });

  it('should accept request with direct input data', () => {
    const request: PredictionRequest = {
      modelName: 'revenue_forecaster',
      inputData: {
        deal_size: 50000,
        sales_cycle: 45,
        product_count: 3,
      },
      returnConfidence: true,
    };

    expect(() => PredictionRequestSchema.parse(request)).not.toThrow();
  });
});

describe('PredictionResultSchema', () => {
  it('should accept basic prediction result', () => {
    const result = {
      modelName: 'lead_scoring_model',
      modelVersion: '1.0.0',
      recordId: 'lead_123',
      prediction: 0.87,
      confidence: 0.92,
    };

    expect(() => PredictionResultSchema.parse(result)).not.toThrow();
  });

  it('should accept classification result with probabilities', () => {
    const result = {
      modelName: 'lead_quality_classifier',
      modelVersion: '2.0.0',
      recordId: 'lead_456',
      prediction: 'A',
      confidence: 0.85,
      probabilities: {
        A: 0.85,
        B: 0.10,
        C: 0.04,
        D: 0.01,
      },
    };

    expect(() => PredictionResultSchema.parse(result)).not.toThrow();
  });

  it('should accept result with explanation', () => {
    const result = {
      modelName: 'churn_predictor',
      modelVersion: '1.5.0',
      recordId: 'customer_789',
      prediction: true,
      confidence: 0.78,
      explanation: {
        topFeatures: [
          {
            feature: 'support_tickets',
            importance: 0.42,
            value: 15,
          },
          {
            feature: 'account_age',
            importance: 0.28,
            value: 90,
          },
          {
            feature: 'total_spend',
            importance: 0.20,
            value: 1250.5,
          },
        ],
        reasoning: 'High support ticket count indicates dissatisfaction',
      },
      metadata: {
        executionTime: 125,
        timestamp: '2024-01-01T12:00:00Z',
      },
    };

    expect(() => PredictionResultSchema.parse(result)).not.toThrow();
  });
});

describe('ModelDriftSchema', () => {
  it('should accept feature drift alert', () => {
    const drift = {
      modelName: 'lead_scoring_model',
      driftType: 'feature_drift' as const,
      severity: 'medium' as const,
      detectedAt: '2024-01-15T10:00:00Z',
      metrics: {
        driftScore: 0.35,
        affectedFeatures: ['engagement_score', 'company_size'],
      },
      recommendation: 'Consider retraining the model with recent data',
    };

    expect(() => ModelDriftSchema.parse(drift)).not.toThrow();
  });

  it('should accept performance drift alert', () => {
    const drift = {
      modelName: 'churn_predictor',
      driftType: 'performance_drift' as const,
      severity: 'high' as const,
      detectedAt: '2024-01-15T11:30:00Z',
      metrics: {
        driftScore: 0.62,
        performanceChange: -0.12,
      },
      recommendation: 'Immediate retraining recommended',
      autoRetrainTriggered: true,
    };

    expect(() => ModelDriftSchema.parse(drift)).not.toThrow();
  });
});

describe('Real-World Model Examples', () => {
  it('should accept lead conversion prediction model', () => {
    const model: PredictiveModel = {
      name: 'lead_conversion_predictor',
      label: 'Lead Conversion Prediction',
      description: 'Predicts probability of lead conversion to opportunity',
      type: 'classification',
      algorithm: 'gradient_boosting',
      objectName: 'lead',
      target: 'converted',
      targetType: 'binary',
      features: [
        {
          name: 'engagement_score',
          field: 'engagement_score',
          dataType: 'numeric',
          transformation: 'standardize',
          description: 'Composite engagement metric',
        },
        {
          name: 'company_size',
          field: 'employee_count',
          dataType: 'numeric',
          transformation: 'log_transform',
        },
        {
          name: 'industry_sector',
          field: 'industry',
          dataType: 'categorical',
          transformation: 'one_hot_encode',
        },
        {
          name: 'email_interactions',
          field: 'email_open_rate',
          dataType: 'numeric',
          transformation: 'normalize',
        },
        {
          name: 'website_visits',
          field: 'site_visit_count',
          dataType: 'numeric',
        },
      ],
      hyperparameters: {
        numTrees: 200,
        maxDepth: 8,
        learningRate: 0.1,
        l2Regularization: 0.01,
      },
      training: {
        trainingDataRatio: 0.75,
        validationDataRatio: 0.15,
        testDataRatio: 0.10,
        dataFilter: 'created_date >= DATE_SUB(NOW(), INTERVAL 2 YEAR)',
        minRecords: 5000,
        strategy: 'full',
        crossValidation: true,
        folds: 5,
      },
      metrics: {
        accuracy: 0.88,
        precision: 0.84,
        recall: 0.91,
        f1Score: 0.87,
        auc: 0.93,
      },
      deploymentStatus: 'deployed',
      version: '3.2.1',
      predictionField: 'conversion_probability',
      confidenceField: 'prediction_confidence',
      updateTrigger: 'on_update',
      autoRetrain: true,
      retrainSchedule: '0 2 * * 0',
      retrainThreshold: 0.05,
      enableExplainability: true,
      enableMonitoring: true,
      alertOnDrift: true,
      active: true,
      category: 'sales',
      tags: ['lead-scoring', 'conversion', 'ml'],
    };

    expect(() => PredictiveModelSchema.parse(model)).not.toThrow();
  });

  it('should accept customer lifetime value prediction', () => {
    const model: PredictiveModel = {
      name: 'customer_ltv_predictor',
      label: 'Customer Lifetime Value Prediction',
      type: 'regression',
      algorithm: 'random_forest',
      objectName: 'customer',
      target: 'lifetime_value',
      targetType: 'numeric',
      features: [
        {
          name: 'purchase_frequency',
          field: 'orders_per_month',
          dataType: 'numeric',
          transformation: 'standardize',
        },
        {
          name: 'average_order_value',
          field: 'avg_order_amount',
          dataType: 'numeric',
          transformation: 'log_transform',
        },
        {
          name: 'customer_tenure',
          field: 'days_since_first_purchase',
          dataType: 'numeric',
        },
        {
          name: 'product_categories',
          field: 'purchased_categories',
          dataType: 'text',
          transformation: 'embedding',
        },
      ],
      hyperparameters: {
        numTrees: 150,
        maxDepth: 12,
        minSamplesSplit: 10,
      },
      metrics: {
        rmse: 245.8,
        mae: 189.2,
        r2Score: 0.82,
      },
      deploymentStatus: 'deployed',
      category: 'marketing',
      active: true,
    };

    expect(() => PredictiveModelSchema.parse(model)).not.toThrow();
  });

  it('should accept demand forecasting model', () => {
    const model: PredictiveModel = {
      name: 'product_demand_forecaster',
      label: 'Product Demand Forecasting',
      type: 'forecasting',
      algorithm: 'arima',
      objectName: 'inventory',
      target: 'demand_quantity',
      features: [
        {
          name: 'historical_demand',
          field: 'daily_sales',
          dataType: 'numeric',
        },
        {
          name: 'day_of_week',
          field: 'weekday',
          dataType: 'categorical',
        },
        {
          name: 'promotion_active',
          field: 'has_promotion',
          dataType: 'boolean',
        },
      ],
      hyperparameters: {
        seasonalPeriod: 7,
        forecastHorizon: 14,
      },
      metrics: {
        mape: 0.12,
        smape: 0.115,
      },
      deploymentStatus: 'deployed',
      updateTrigger: 'scheduled',
      category: 'operations',
      active: true,
    };

    expect(() => PredictiveModelSchema.parse(model)).not.toThrow();
  });
});
