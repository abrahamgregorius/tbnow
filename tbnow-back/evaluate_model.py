import numpy as np
from sklearn.metrics import f1_score, precision_score, recall_score, classification_report

def evaluate_model(y_true, y_pred, class_names=None):
    """
    Evaluate model performance with F1 score and other metrics.

    Args:
        y_true: Ground truth labels (list or array)
        y_pred: Predicted labels (list or array)
        class_names: Optional list of class names for multi-class

    Returns:
        dict: Dictionary with evaluation metrics
    """
    # Convert to numpy arrays
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)

    # Calculate metrics
    f1 = f1_score(y_true, y_pred, average='binary' if len(np.unique(y_true)) == 2 else 'macro')
    precision = precision_score(y_true, y_pred, average='binary' if len(np.unique(y_true)) == 2 else 'macro')
    recall = recall_score(y_true, y_pred, average='binary' if len(np.unique(y_true)) == 2 else 'macro')

    # Classification report
    report = classification_report(y_true, y_pred, target_names=class_names)

    results = {
        'f1_score': f1,
        'precision': precision,
        'recall': recall,
        'classification_report': report
    }

    return results

def tune_for_precision(y_true, y_proba, thresholds=np.arange(0.1, 0.9, 0.1)):
    """
    Tune decision threshold to maximize precision (reduce false positives).

    Args:
        y_true: Ground truth labels
        y_proba: Predicted probabilities for positive class
        thresholds: Array of thresholds to test

    Returns:
        dict: Best threshold and corresponding metrics
    """
    best_precision = 0
    best_thresh = 0.5
    best_metrics = {}

    for thresh in thresholds:
        y_pred = (y_proba > thresh).astype(int)
        precision = precision_score(y_true, y_pred)
        if precision > best_precision:
            best_precision = precision
            best_thresh = thresh
            best_metrics = evaluate_model(y_true, y_pred)

    return {
        'best_threshold': best_thresh,
        'best_precision': best_precision,
        'metrics': best_metrics
    }

# Example usage
if __name__ == "__main__":
    # Example for TB detection (0 = Normal, 1 = TB)
    y_true_example = [0, 1, 1, 0, 1, 0, 1, 1, 0, 0]
    y_pred_example = [0, 1, 0, 0, 1, 0, 1, 1, 1, 0]

    print("=== Default Threshold (0.5) ===")
    results = evaluate_model(y_true_example, y_pred_example, class_names=['Normal', 'TB'])
    print("F1 Score:", results['f1_score'])
    print("Precision:", results['precision'])
    print("Recall:", results['recall'])
    print("\nClassification Report:\n", results['classification_report'])

    # Example with probabilities for threshold tuning
    # Assuming y_proba is the probability for class 1 (TB)
    y_proba_example = np.array([0.2, 0.8, 0.4, 0.1, 0.9, 0.3, 0.7, 0.6, 0.55, 0.2])  # Simulated probabilities

    print("\n=== Threshold Tuning for Precision ===")
    tune_results = tune_for_precision(y_true_example, y_proba_example)
    print(f"Best Threshold: {tune_results['best_threshold']}")
    print(f"Best Precision: {tune_results['best_precision']}")
    print("Metrics at best threshold:")
    print("F1 Score:", tune_results['metrics']['f1_score'])
    print("Precision:", tune_results['metrics']['precision'])
    print("Recall:", tune_results['metrics']['recall'])