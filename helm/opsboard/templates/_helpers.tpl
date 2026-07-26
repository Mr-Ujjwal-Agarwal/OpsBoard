{{/*
Expand the chart name.
*/}}
{{- define "opsboard.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{/*
Create a fully qualified application name.
*/}}
{{- define "opsboard.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s" .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{/*
Common Labels
*/}}
{{- define "opsboard.labels" -}}
app.kubernetes.io/name: {{ include "opsboard.name" . }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector Labels
*/}}
{{- define "opsboard.selectorLabels" -}}
app.kubernetes.io/name: {{ include "opsboard.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
