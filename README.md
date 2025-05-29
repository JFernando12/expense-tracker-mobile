# 📊 Expense Tracker Mobile App

<div align="center">
  
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

## 📝 Project Description

A mobile expense tracking application built with [Expo](https://expo.dev) and created using [`create-expo-app`](https://www.npmjs.com/package/create-expo-app). This app helps users track their expenses and income across multiple wallets, visualize spending patterns, and manage their finances on the go.

## 🗄️ Data Models

### Category
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| name | string | Category name |
| type | enum | Either 'expense' or 'income' |
| icon | string | Icon identifier |

### Wallet
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| userId | string | Owner of the wallet |
| name | string | Wallet name |
| description | string | Description of the wallet |
| initialBalance | number | Starting balance |
| currentBalance | number | Current balance |

### Transaction
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| userId | string | Owner of the transaction |
| accountId | string | Associated wallet |
| categoryId | string | Associated category |
| amount | number | Transaction amount |
| type | enum | Either 'expense' or 'income' |
| description | string | Transaction description |
| date | Date | Date of the transaction |

## 🎨 Default Categories

### Expense Categories
```json
[
  {"name": "Food & Dining", "type": "expense", "icon": "utensils", "color": "#f59e0b", "isDefault": true},
  {"name": "Transportation", "type": "expense", "icon": "car", "color": "#3b82f6", "isDefault": true},
  {"name": "Shopping", "type": "expense", "icon": "shopping-bag", "color": "#ec4899", "isDefault": true},
  {"name": "Entertainment", "type": "expense", "icon": "film", "color": "#8b5cf6", "isDefault": true},
  {"name": "Bills & Utilities", "type": "expense", "icon": "receipt", "color": "#ef4444", "isDefault": true},
  {"name": "Healthcare", "type": "expense", "icon": "heart", "color": "#10b981", "isDefault": true},
  {"name": "Personal Care", "type": "expense", "icon": "user", "color": "#84cc16", "isDefault": true},
  {"name": "Other Expenses", "type": "expense", "icon": "more-horizontal", "color": "#94a3b8", "isDefault": true}
]
```

### Income Categories
```json
[
  {"name": "Salary", "type": "income", "icon": "briefcase", "color": "#10b981", "isDefault": true},
  {"name": "Freelance", "type": "income", "icon": "laptop", "color": "#3b82f6", "isDefault": true},
  {"name": "Investment", "type": "income", "icon": "trending-up", "color": "#8b5cf6", "isDefault": true},
  {"name": "Business", "type": "income", "icon": "building", "color": "#f59e0b", "isDefault": true},
  {"name": "Gift", "type": "income", "icon": "gift", "color": "#ec4899", "isDefault": true},
  {"name": "Other Income", "type": "income", "icon": "plus", "color": "#6b7280", "isDefault": true}
]
```