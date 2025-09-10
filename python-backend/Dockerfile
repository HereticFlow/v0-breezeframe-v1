# Multi-stage build pour optimiser la taille de l'image
FROM python:3.11-slim as builder

# Variables d'environnement pour Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Installer les dépendances système nécessaires
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    libv4l-dev \
    libxvidcore-dev \
    libx264-dev \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libatlas-base-dev \
    gfortran \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Créer un utilisateur non-root
RUN useradd --create-home --shell /bin/bash app

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de requirements
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Stage de production
FROM python:3.11-slim as production

# Variables d'environnement
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    FLASK_APP=window_analyzer.py \
    FLASK_ENV=production \
    FLASK_RUN_HOST=0.0.0.0 \
    FLASK_RUN_PORT=5000

# Installer les dépendances runtime
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libavcodec58 \
    libavformat58 \
    libswscale5 \
    libv4l-0 \
    libxvidcore4 \
    libx264-160 \
    libjpeg62-turbo \
    libpng16-16 \
    libtiff5 \
    libatlas3-base \
    && rm -rf /var/lib/apt/lists/*

# Créer un utilisateur non-root
RUN useradd --create-home --shell /bin/bash app

# Définir le répertoire de travail
WORKDIR /app

# Copier les dépendances Python depuis le stage builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Créer les répertoires nécessaires
RUN mkdir -p /app/models /app/uploads /app/temp /app/logs && \
    chown -R app:app /app

# Copier les fichiers de l'application
COPY --chown=app:app window_analyzer.py .
COPY --chown=app:app start_server.sh .

# Rendre le script de démarrage exécutable
RUN chmod +x start_server.sh

# Changer vers l'utilisateur non-root
USER app

# Exposer le port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5000/health', timeout=5)" || exit 1

# Commande par défaut
CMD ["./start_server.sh"]

# Labels pour la documentation
LABEL maintainer="BreezeFrame Team" \
      version="2.1.0" \
      description="Backend Python pour l'analyse AI de fenêtres BreezeFrame" \
      org.opencontainers.image.title="BreezeFrame Python Backend" \
      org.opencontainers.image.description="Service d'analyse d'images de fenêtres avec TensorFlow et OpenCV" \
      org.opencontainers.image.version="2.1.0" \
      org.opencontainers.image.vendor="BreezeFrame" \
      org.opencontainers.image.licenses="MIT"
