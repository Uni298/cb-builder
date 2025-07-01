# cb-builder

`cb`関数で他のコードと結合できるライブラリです。

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

↓

**出力例**
```
0
1
1
2
2
3
3
4
4
5
```

## コマンド

結合 & 実行(config.txtで設定可能) `npm run build`

### 設定

**config.txt**
`file=index.js` | 結合ファイル
`out=build.js` | 結合済みファイル
`run=true` | 結合した後に実行するか

### インストール

```
npm install cb-build
```
