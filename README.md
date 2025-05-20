erDiagram
    %% 엔티티 정의
    IMPORT_VENDORS {
      INT    id PK
      VARCHAR v_name
      DECIMAL deposit_rate
    }
    IMPORT_PO_LIST {
      INT       id PK
      INT       vendor_id FK
      DATE      po_date
      VARCHAR   po_no
      INT       pcs
      DECIMAL   cost_rmb
      DECIMAL   exchange_rate
      DECIMAL   total_rmb
      DECIMAL   total_usd
      DECIMAL   dp_amount_rmb
      DECIMAL   dp_amount_usd
      DATE      dp_date
      ENUM      dp_status
      DECIMAL   bp_amount_rmb
      DECIMAL   bp_amount_usd
      DATE      bp_date
      ENUM      bp_status
      DECIMAL   remain_rmb
      DECIMAL   remain_usd
    }
    IMPORT_TEMP_LIST {
      INT       id PK
      VARCHAR   user_id
      INT       vendor_id FK
      DATE      po_date
      VARCHAR   po_no
      INT       pcs
      DECIMAL   cost_rmb
      DECIMAL   exchange_rate
      DECIMAL   total_rmb
      DECIMAL   total_usd
      DECIMAL   dp_amount_rmb
      DECIMAL   dp_amount_usd
      DATE      dp_date
      DECIMAL   dp_rate
      ENUM      dp_status
      DECIMAL   bp_amount_rmb
      DECIMAL   bp_amount_usd
      DATE      bp_date
      DECIMAL   bp_rate
      ENUM      bp_status
    }
    IMPORT_DEPOSIT_LIST {
      INT       id PK
      INT       po_id FK
      INT       vendor_id FK
      VARCHAR   user_id
      DATE      dp_date
      DECIMAL   dp_rate
      DECIMAL   dp_amount_rmb
      DECIMAL   dp_amount_usd
      DECIMAL   exchange_rate
    }
    IMPORT_BALANCE_LIST {
      INT       id PK
      INT       po_id FK
      INT       vendor_id FK
      VARCHAR   user_id
      DATE      bp_date
      DECIMAL   bp_rate
      DECIMAL   bp_amount_rmb
      DECIMAL   bp_amount_usd
      DECIMAL   exchange_rate
    }

    %% 관계 설정
    IMPORT_VENDORS ||--o{ IMPORT_PO_LIST         : "1:N vendor_id"
    IMPORT_VENDORS ||--o{ IMPORT_TEMP_LIST       : "1:N vendor_id"
    IMPORT_VENDORS ||--o{ IMPORT_DEPOSIT_LIST    : "1:N vendor_id"
    IMPORT_VENDORS ||--o{ IMPORT_BALANCE_LIST    : "1:N vendor_id"

    IMPORT_PO_LIST   ||--o{ IMPORT_DEPOSIT_LIST    : "1:N po_id"
    IMPORT_PO_LIST   ||--o{ IMPORT_BALANCE_LIST    : "1:N po_id"
