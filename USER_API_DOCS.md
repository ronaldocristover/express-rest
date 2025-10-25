# User REST API Documentation

API ini menyediakan endpoints untuk mengelola data user dengan field nama dan nomor telepon.

## Base URL

```
http://localhost:3000/api/v1/users
```

## Endpoints

### 1. GET /users

Mendapatkan semua users dengan pagination dan pencarian

**Query Parameters:**

- `page` (optional): Halaman data (default: 1)
- `pageSize` (optional): Jumlah data per halaman (default: 10)
- `search` (optional): Kata kunci untuk pencarian berdasarkan nama, telepon, atau email

**Response:**

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "items": [
      {
        "id": "clxxx",
        "nama": "John Doe",
        "telp": "081234567890",
        "email": "john@example.com",
        "apiKey": null,
        "createdAt": "2024-10-24T10:00:00.000Z",
        "updatedAt": "2024-10-24T10:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "pages": 1
  }
}
```

### 2. GET /users/:id

Mendapatkan user berdasarkan ID

**Response:**

```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "clxxx",
    "nama": "John Doe",
    "telp": "081234567890",
    "email": "john@example.com",
    "apiKey": null,
    "createdAt": "2024-10-24T10:00:00.000Z",
    "updatedAt": "2024-10-24T10:00:00.000Z"
  }
}
```

### 3. GET /users/telp/:telp

Mendapatkan user berdasarkan nomor telepon

**Response:** Same as GET /users/:id

### 4. POST /users

Membuat user baru

**Request Body:**

```json
{
  "nama": "John Doe",
  "telp": "081234567890",
  "email": "john@example.com" // optional
}
```

**Validation Rules:**

- `nama`: Required, minimal 2 karakter, maksimal 100 karakter
- `telp`: Required, format nomor Indonesia (081234567890, +6281234567890, atau 6281234567890)
- `email`: Optional, format email valid

**Response:**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "clxxx",
    "nama": "John Doe",
    "telp": "081234567890",
    "email": "john@example.com",
    "apiKey": null,
    "createdAt": "2024-10-24T10:00:00.000Z",
    "updatedAt": "2024-10-24T10:00:00.000Z"
  }
}
```

### 5. PUT /users/:id

Update user berdasarkan ID

**Request Body:**

```json
{
  "nama": "Jane Doe", // optional
  "telp": "081987654321", // optional
  "email": "jane@example.com" // optional
}
```

**Response:** Same as POST /users

### 6. DELETE /users/:id

Hapus user berdasarkan ID

**Response:**

```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": {
    "id": "clxxx",
    "nama": "John Doe",
    "telp": "081234567890",
    "email": "john@example.com",
    "apiKey": null,
    "createdAt": "2024-10-24T10:00:00.000Z",
    "updatedAt": "2024-10-24T10:00:00.000Z"
  }
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Format nomor telepon tidak valid (contoh: 081234567890)"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "User tidak ditemukan"
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "User dengan nomor telepon ini sudah terdaftar"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Fitur Keamanan

### Husky Pre-commit Hooks

Setiap commit akan otomatis menjalankan:

1. **ESLint Check**: Memastikan kode mengikuti standar coding
2. **Unused Variables Check**: Mendeteksi variabel yang tidak digunakan
3. **Console.log Detection**: Mencegah console.log masuk ke production
4. **Secret Detection**: Mencari potensi secret keys atau API keys yang ter-commit

### Pre-commit Script akan mencegah commit jika ditemukan:

- Error ESLint
- Variabel yang tidak digunakan
- Statement `console.log`
- Potensi secret keys (API keys, passwords, database URLs, dll.)

## Menjalankan Server

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Testing
npm test

# Database migration
npm run db:migrate
```

## Environment Variables Required

```env
DATABASE_URL="mysql://user:password@localhost:3307/express_rest"
NODE_ENV="development"
PORT=3000
```
