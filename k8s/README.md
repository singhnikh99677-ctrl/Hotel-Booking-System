# Kubernetes Deployment Notes

## Apply manifests

```bash
kubectl apply -f k8s/
```

## Check resources

```bash
kubectl get pods -n hotel-booking
kubectl get deployments -n hotel-booking
kubectl get services -n hotel-booking
```

## Check rollout status

```bash
kubectl rollout status deployment/hotel-api -n hotel-booking
kubectl rollout history deployment/hotel-api -n hotel-booking
kubectl rollout undo deployment/hotel-api -n hotel-booking
```

## Port forwarding

```bash
kubectl port-forward service/hotel-api -n hotel-booking 8000:80
```

## Important note

This assignment uses SQLite. In a multi-replica Kubernetes deployment, each pod has its own local SQLite file unless a shared persistent volume is configured. For this educational project, that is acceptable, but production workloads should use a shared database service.
