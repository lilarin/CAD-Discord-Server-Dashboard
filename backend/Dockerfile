FROM python:3.12-slim

ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH=/

WORKDIR /backend

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
