import{test}from'node:test';import assert from'node:assert/strict';import{exactMoney}from'../lib/analytics/format.ts';
test('Indian money formatting preserves exact fractional strings and signs without numeric conversion',()=>{
 assert.equal(exactMoney('123456789.12345678'),'₹12,34,56,789.12345678');assert.equal(exactMoney('-14048.5'),'−₹14,048.5');assert.equal(exactMoney('0'),'₹0');assert.equal(exactMoney('0.00000001'),'₹0.00000001');
});

test('dashboard money rounds to two decimals exactly with carries, large values and no negative zero',async()=>{
 const {displayMoney}=await import('../lib/analytics/format.ts');
 assert.equal(displayMoney('58.33333333'),'₹58.33');assert.equal(displayMoney('58.335'),'₹58.34');assert.equal(displayMoney('999.99999999'),'₹1,000.00');assert.equal(displayMoney('-0.004'),'₹0.00');assert.equal(displayMoney('-0.005'),'−₹0.01');assert.equal(displayMoney('12345678901234567890.125'),'₹1,23,45,67,89,01,23,45,67,890.13');assert.equal(displayMoney('invalid'),'—');
});
