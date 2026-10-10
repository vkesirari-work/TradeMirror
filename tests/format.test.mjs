import{test}from'node:test';import assert from'node:assert/strict';import{exactMoney}from'../lib/analytics/format.ts';
test('Indian money formatting preserves exact fractional strings and signs without numeric conversion',()=>{
 assert.equal(exactMoney('123456789.12345678'),'₹12,34,56,789.12345678');assert.equal(exactMoney('-14048.5'),'−₹14,048.5');assert.equal(exactMoney('0'),'₹0');assert.equal(exactMoney('0.00000001'),'₹0.00000001');
});
