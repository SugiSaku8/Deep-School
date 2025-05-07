    // main.ts
    import { exec } from 'child_process';

    function runScript(scriptPath: string, callback: (err: Error | null) => void) {
      exec(`sh ${scriptPath}`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return callback(error);
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        callback(null);
      });
    }

    runScript('./staRt.sh', (err) => {
      if (err) {
        console.log("Failed to start staRt.sh");
      } else {
        console.log("staRt.sh started successfully");
      }
    });