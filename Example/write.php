<?php
// $myFile =   $_POST['file'];
$fh = fopen("file.md", 'w') or die("can't open file");
// $stringData = $_POST['data'];
fwrite($fh,"ciao");
fclose($fh);
?>