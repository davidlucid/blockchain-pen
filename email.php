<?php

if (mail($_GET["to"], "Transaction Link", "The link to your transaction is as follows:\n\n" . $_GET["txid"] . "\n\nThank you for using Blockchain-Notary.com!")) echo "success";