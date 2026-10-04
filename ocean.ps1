$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
node "$ScriptDir\bin\ocean.js" $args
