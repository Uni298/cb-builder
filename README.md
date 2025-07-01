# cb-builder

`cb`関数で他のコードを読み出せるライブラリです。

## 関数
`cb('console.js')`

### 例

[index.js]
```javascript
for (let i;i > 5;i++) {
  cb('console.js');
  console.log(x)
}
```

[console.js]
```jacascript
x = i + 1
console.log(i);
```
