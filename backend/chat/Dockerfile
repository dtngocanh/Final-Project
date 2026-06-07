# Sử dụng phiên bản python slim để giảm dung lượng (nhẹ hơn bản full)
FROM python:3.11-slim

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Cài đặt các thư viện hệ thống cần thiết cho các thư viện tính toán (scikit-learn, pandas...)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements và cài đặt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code dự án vào container
COPY . .

# Mở cổng 8000 cho FastAPI
EXPOSE 8000

# Lệnh chạy ứng dụng
CMD ["uvicorn", "chat_api:app", "--host", "0.0.0.0", "--port", "8000"]