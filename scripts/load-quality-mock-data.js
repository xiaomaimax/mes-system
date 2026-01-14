/**
 * 将质量管理模块的模拟数据导入数据库
 * 包括: FQC、PQC、OQC、缺陷记录、缺陷原因、检验标准、批次追溯
 */

require('dotenv').config();
const pool = require('../server/config/mysql');

async function loadQualityMockData() {
  try {
    console.log('开始导入质量管理模拟数据...\n');

    // ==================== FQC检验数据 ====================
    console.log('1. 导入FQC检验数据...');
    const fqcData = [
      {
        inspection_id: 'FQC-2024-001',
        batch_number: 'BATCH-A001',
        product_name: '产品A',
        inspection_date: '2024-01-15',
        inspector: '张三',
        inspection_qty: 50,
        qualified_qty: 48,
        pass_rate: 96.0,
        inspection_result: 'pass',
        status: 'completed',
        notes: 'FQC检验合格'
      },
      {
        inspection_id: 'FQC-2024-002',
        batch_number: 'BATCH-B001',
        product_name: '产品B',
        inspection_date: '2024-01-16',
        inspector: '李四',
        inspection_qty: 50,
        qualified_qty: 47,
        pass_rate: 94.0,
        inspection_result: 'pass',
        status: 'completed',
        notes: 'FQC检验合格'
      },
      {
        inspection_id: 'FQC-2024-003',
        batch_number: 'BATCH-C001',
        product_name: '产品C',
        inspection_date: '2024-01-17',
        inspector: '王五',
        inspection_qty: 50,
        qualified_qty: 45,
        pass_rate: 90.0,
        inspection_result: 'pass',
        status: 'completed',
        notes: 'FQC检验合格'
      }
    ];

    for (const record of fqcData) {
      await pool.query(
        `INSERT INTO fqc_inspections 
         (inspection_id, batch_number, product_name, inspection_date, inspector, 
          inspection_qty, qualified_qty, pass_rate, inspection_result, status, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [record.inspection_id, record.batch_number, record.product_name, record.inspection_date,
         record.inspector, record.inspection_qty, record.qualified_qty, record.pass_rate,
         record.inspection_result, record.status, record.notes]
      );
    }
    console.log(`✓ 成功导入 ${fqcData.length} 条FQC检验数据\n`);

    // ==================== PQC检验数据 ====================
    console.log('2. 导入PQC检验数据...');
    const pqcData = [
      {
        inspection_id: 'PQC-2024-001',
        production_order: 'PO-2024-001',
        product_name: '产品A',
        inspection_date: '2024-01-15',
        inspector: '张三',
        inspection_qty: 100,
        qualified_qty: 98,
        pass_rate: 98.0,
        inspection_result: 'pass',
        status: 'completed',
        notes: 'PQC检验合格'
      },
      {
        inspection_id: 'PQC-2024-002',
        production_order: 'PO-2024-002',
        product_name: '产品B',
        inspection_date: '2024-01-16',
        inspector: '李四',
        inspection_qty: 100,
        qualified_qty: 96,
        pass_rate: 96.0,
        inspection_result: 'pass',
        status: 'completed',
        notes: 'PQC检验合格'
      },
      {
        inspection_id: 'PQC-2024-003',
        production_order: 'PO-2024-003',
        product_name: '产品C',
        inspection_date: '2024-01-17',
        inspector: '王五',
        inspection_qty: 100,
        qualified_qty: 92,
        pass_rate: 92.0,
        inspection_result: 'pass',
        status: 'completed',
        notes: 'PQC检验合格'
      }
    ];

    for (const record of pqcData) {
      await pool.query(
        `INSERT INTO pqc_inspections 
         (inspection_id, production_order, product_name, inspection_date, inspector, 
          inspection_qty, qualified_qty, pass_rate, inspection_result, status, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [record.inspection_id, record.production_order, record.product_name, record.inspection_date,
         record.inspector, record.inspection_qty, record.qualified_qty, record.pass_rate,
         record.inspection_result, record.status, record.notes]
      );
    }
    console.log(`✓ 成功导入 ${pqcData.length} 条PQC检验数据\n`);

    // ==================== OQC检验数据 ====================
    console.log('3. 导入OQC检验数据...');
    const oqcData = [
      {
        inspection_id: 'OQC-2024-001',
        batch_number: 'BATCH-A001',
        product_name: '产品A',
        inspection_date: '2024-01-15',
        inspector: '张三',
        inspection_qty: 50,
        qualified_qty: 50,
        pass_rate: 100.0,
        inspection_result: 'pass',
        status: 'completed',
        notes: 'OQC检验合格'
      },
      {
        inspection_id: 'OQC-2024-002',
        batch_number: 'BATCH-B001',
        product_name: '产品B',
        inspection_date: '2024-01-16',
        inspector: '李四',
        inspection_qty: 50,
        qualified_qty: 49,
        pass_rate: 98.0,
        inspection_result: 'pass',
        status: 'completed',
        notes: 'OQC检验合格'
      },
      {
        inspection_id: 'OQC-2024-003',
        batch_number: 'BATCH-C001',
        product_name: '产品C',
        inspection_date: '2024-01-17',
        inspector: '王五',
        inspection_qty: 50,
        qualified_qty: 48,
        pass_rate: 96.0,
        inspection_result: 'pass',
        status: 'completed',
        notes: 'OQC检验合格'
      }
    ];

    for (const record of oqcData) {
      await pool.query(
        `INSERT INTO oqc_inspections 
         (inspection_id, batch_number, product_name, inspection_date, inspector, 
          inspection_qty, qualified_qty, pass_rate, inspection_result, status, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [record.inspection_id, record.batch_number, record.product_name, record.inspection_date,
         record.inspector, record.inspection_qty, record.qualified_qty, record.pass_rate,
         record.inspection_result, record.status, record.notes]
      );
    }
    console.log(`✓ 成功导入 ${oqcData.length} 条OQC检验数据\n`);

    // ==================== 缺陷原因数据 ====================
    console.log('4. 导入缺陷原因数据...');
    const defectReasonsData = [
      {
        reason_id: 'DR-001',
        reason_code: 'SIZE_ERROR',
        reason_name: '尺寸偏差',
        category: '尺寸类',
        description: '产品尺寸超出规格范围',
        status: 'enabled'
      },
      {
        reason_id: 'DR-002',
        reason_code: 'SURFACE_SCRATCH',
        reason_name: '表面划痕',
        category: '表面类',
        description: '产品表面有划痕或损伤',
        status: 'enabled'
      },
      {
        reason_id: 'DR-003',
        reason_code: 'MATERIAL_ERROR',
        reason_name: '材质不符',
        category: '材质类',
        description: '使用了错误的材质',
        status: 'enabled'
      },
      {
        reason_id: 'DR-004',
        reason_code: 'PACKAGE_DAMAGE',
        reason_name: '包装破损',
        category: '包装类',
        description: '产品包装破损或变形',
        status: 'enabled'
      },
      {
        reason_id: 'DR-005',
        reason_code: 'COLOR_MISMATCH',
        reason_name: '颜色不符',
        category: '外观类',
        description: '产品颜色与规格不符',
        status: 'enabled'
      }
    ];

    for (const record of defectReasonsData) {
      await pool.query(
        `INSERT INTO defect_reasons 
         (reason_id, reason_code, reason_name, category, description, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [record.reason_id, record.reason_code, record.reason_name, record.category,
         record.description, record.status]
      );
    }
    console.log(`✓ 成功导入 ${defectReasonsData.length} 条缺陷原因数据\n`);

    // ==================== 检验标准数据 ====================
    console.log('5. 导入检验标准数据...');
    const inspectionStandardsData = [
      {
        standard_id: 'IS-001',
        product_name: '产品A',
        standard_code: 'STD-A001',
        standard_name: '产品A检验标准',
        version: 'v1.0',
        status: 'enabled'
      },
      {
        standard_id: 'IS-002',
        product_name: '产品B',
        standard_code: 'STD-B001',
        standard_name: '产品B检验标准',
        version: 'v1.0',
        status: 'enabled'
      },
      {
        standard_id: 'IS-003',
        product_name: '产品C',
        standard_code: 'STD-C001',
        standard_name: '产品C检验标准',
        version: 'v1.0',
        status: 'enabled'
      }
    ];

    for (const record of inspectionStandardsData) {
      await pool.query(
        `INSERT INTO inspection_standards 
         (standard_id, product_name, standard_code, standard_name, version, status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [record.standard_id, record.product_name, record.standard_code, record.standard_name,
         record.version, record.status]
      );
    }
    console.log(`✓ 成功导入 ${inspectionStandardsData.length} 条检验标准数据\n`);

    // ==================== 缺陷记录数据 ====================
    console.log('6. 导入缺陷记录数据...');
    const defectRecordsData = [
      {
        defect_code: 'DEF-001',
        defect_name: '尺寸偏差',
        defect_category: '尺寸类',
        severity: 'minor',
        description: '产品尺寸超出规格范围'
      },
      {
        defect_code: 'DEF-002',
        defect_name: '表面划痕',
        defect_category: '表面类',
        severity: 'minor',
        description: '产品表面有划痕或损伤'
      },
      {
        defect_code: 'DEF-003',
        defect_name: '材质不符',
        defect_category: '材质类',
        severity: 'major',
        description: '使用了错误的材质'
      },
      {
        defect_code: 'DEF-004',
        defect_name: '包装破损',
        defect_category: '包装类',
        severity: 'minor',
        description: '产品包装破损或变形'
      },
      {
        defect_code: 'DEF-005',
        defect_name: '颜色不符',
        defect_category: '外观类',
        severity: 'major',
        description: '产品颜色与规格不符'
      }
    ];

    for (const record of defectRecordsData) {
      await pool.query(
        `INSERT INTO defect_records 
         (defect_code, defect_name, defect_category, severity, description) 
         VALUES (?, ?, ?, ?, ?)`,
        [record.defect_code, record.defect_name, record.defect_category,
         record.severity, record.description]
      );
    }
    console.log(`✓ 成功导入 ${defectRecordsData.length} 条缺陷记录数据\n`);

    // ==================== 批次追溯数据 ====================
    console.log('7. 导入批次追溯数据...');
    const batchTracingData = [
      {
        batch_number: 'BATCH-A001',
        product_name: '产品A',
        production_date: '2024-01-15',
        iqc_status: 'pass',
        pqc_status: 'pass',
        fqc_status: 'pass',
        oqc_status: 'pass',
        overall_status: 'qualified',
        notes: '批次合格'
      },
      {
        batch_number: 'BATCH-B001',
        product_name: '产品B',
        production_date: '2024-01-16',
        iqc_status: 'pass',
        pqc_status: 'pass',
        fqc_status: 'pass',
        oqc_status: 'pass',
        overall_status: 'qualified',
        notes: '批次合格'
      },
      {
        batch_number: 'BATCH-C001',
        product_name: '产品C',
        production_date: '2024-01-17',
        iqc_status: 'pass',
        pqc_status: 'pass',
        fqc_status: 'pass',
        oqc_status: 'pass',
        overall_status: 'qualified',
        notes: '批次合格'
      }
    ];

    for (const record of batchTracingData) {
      await pool.query(
        `INSERT INTO batch_tracing 
         (batch_number, product_name, production_date, iqc_status, pqc_status, 
          fqc_status, oqc_status, overall_status, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [record.batch_number, record.product_name, record.production_date, record.iqc_status,
         record.pqc_status, record.fqc_status, record.oqc_status, record.overall_status, record.notes]
      );
    }
    console.log(`✓ 成功导入 ${batchTracingData.length} 条批次追溯数据\n`);

    console.log('✅ 所有质量管理模拟数据导入完成！');
    console.log('\n数据统计:');
    console.log(`- FQC检验: ${fqcData.length} 条`);
    console.log(`- PQC检验: ${pqcData.length} 条`);
    console.log(`- OQC检验: ${oqcData.length} 条`);
    console.log(`- 缺陷原因: ${defectReasonsData.length} 条`);
    console.log(`- 检验标准: ${inspectionStandardsData.length} 条`);
    console.log(`- 缺陷记录: ${defectRecordsData.length} 条`);
    console.log(`- 批次追溯: ${batchTracingData.length} 条`);
    console.log(`\n总计: ${fqcData.length + pqcData.length + oqcData.length + defectReasonsData.length + inspectionStandardsData.length + defectRecordsData.length + batchTracingData.length} 条数据`);

  } catch (error) {
    console.error('❌ 导入数据失败:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

loadQualityMockData();
