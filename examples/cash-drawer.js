import ThermalReceiptPrinter from './src/index.js';

async function testCashDrawer() {
  const printer = new ThermalReceiptPrinter();

  console.log('Testing cash drawer with default settings...');
  try {
    await printer.openCashDrawer();
    console.log('✓ Cash drawer opened successfully with defaults');
  } catch (error) {
    console.error('✗ Error opening cash drawer:', error.message);
  }

  console.log('\nTesting cash drawer with custom kick code: 27,112,0,148,49');
  try {
    await printer.openCashDrawer({ kickCode: '27,112,0,148,49' });
    console.log('✓ Cash drawer opened successfully with custom kick code');
  } catch (error) {
    console.error('✗ Error opening cash drawer:', error.message);
  }
}

testCashDrawer();
