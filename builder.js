const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const configPath = path.resolve(__dirname, 'config.txt');

// config.txt がなければ作成
if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, 'file=index.js\noutput=build.js\nrun=true', 'utf-8');
    console.log('⚙️ config.txt を作成しました（デフォルト値）');
}

// 設定読み込み
const config = fs.readFileSync(configPath, 'utf-8')
    .split('\n')
    .filter(line => line.includes('='))
    .reduce((acc, line) => {
        const [key, val] = line.split('=').map(s => s.trim());
        acc[key] = val;
        return acc;
    }, {});

const inputFile = path.resolve(__dirname, config.file || 'index.js');
const outputFile = path.resolve(__dirname, config.output || 'build.js');
const runAfterBuild = config.run === 'true';

// コメント除外しながら include/nf を処理する関数
function processFile(filePath) {
    const dir = path.dirname(filePath);
    let code = fs.readFileSync(filePath, 'utf-8');

    // コメントブロックの場所を記録しておく（index範囲）
    const commentRanges = [];
    const commentRegex = /\/\/.*|\/\*[\s\S]*?\*\//g;
    let match;
    while ((match = commentRegex.exec(code)) !== null) {
        commentRanges.push([match.index, match.index + match[0].length]);
    }

    // 範囲内かどうか確認
    function isInComment(index) {
        return commentRanges.some(([start, end]) => index >= start && index < end);
    }

    // nf()/@include を置換
    const replaceAll = [
        { regex: /nf\(['"](.+?)['"]\)/g },
        { regex: /@include\s+['"](.+?)['"]/g }
    ];

    for (const { regex } of replaceAll) {
        code = code.replace(regex, (match, filename, offset) => {
            if (isInComment(offset)) return match; // コメント内ならスキップ

            const includePath = path.join(dir, filename);
            if (!fs.existsSync(includePath)) {
                throw new Error(`ファイルが見つかりません: ${includePath}`);
            }
            const includedCode = fs.readFileSync(includePath, 'utf-8');
            return includedCode;
        });
    }

    return code;
}

// ビルド処理
try {
    const output = processFile(inputFile);
    fs.writeFileSync(outputFile, output, 'utf-8');
    console.log(`✅ ${path.basename(outputFile)} を出力しました。`);

    if (runAfterBuild) {
        console.log(`🚀 ${path.basename(outputFile)} を実行中...`);
        execSync(`node "${outputFile}"`, { stdio: 'inherit' });
    } else {
        console.log(`🛑 ${path.basename(outputFile)} は実行されません（config.txtでrun=false）`);
    }

} catch (err) {
    console.error('❌ エラー:', err.message);
}
