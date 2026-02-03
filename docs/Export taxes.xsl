<?xml version="1.0" encoding="UTF-8" ?> 
<html xsl:version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<body bgcolor="FFFFD9">
<table border="0" bgcolor="0066CC" width="100%">
<tr>
<td><font face="Tahoma" color="FFFFD9" size="+2">TABLE_CONTENU</font></td>
</tr>
</table>
<p/>
<center>
<table border="1" bordercolor="FFFFD9" cellpadding="3">
<tr>
<td bgcolor="A0A0A0"><font face="Tahoma"><b>N° Enr.</b></font></td>
<td bgcolor="A0A0A0"><font face="Tahoma"><b>IDTaxes</b></font></td>
<td bgcolor="A0A0A0"><font face="Tahoma"><b>LibelleTaxe</b></font></td>
<td bgcolor="A0A0A0"><font face="Tahoma"><b>CodeTaxe</b></font></td>
<td bgcolor="A0A0A0"><font face="Tahoma"><b>LibelleTaxeComplet</b></font></td>
<td bgcolor="A0A0A0"><font face="Tahoma"><b>IdAgent</b></font></td>
<td bgcolor="A0A0A0"><font face="Tahoma"><b>Niveau</b></font></td>
<td bgcolor="A0A0A0"><font face="Tahoma"><b>Base</b></font></td>
</tr>
<xsl:for-each select="WINDEV_TABLE/TABLE_CONTENU">
  <tr>
<td bgcolor="C9E3ED"><font face="Tahoma" size="-1"><xsl:value-of select="N__Enr." /></font></td>
<td bgcolor="EFEFEF"><font face="Tahoma" size="-1"><xsl:value-of select="IDTaxes" /></font></td>
<td bgcolor="EFEFEF"><font face="Tahoma" size="-1"><xsl:value-of select="LibelleTaxe" /></font></td>
<td bgcolor="EFEFEF"><font face="Tahoma" size="-1"><xsl:value-of select="CodeTaxe" /></font></td>
<td bgcolor="EFEFEF"><font face="Tahoma" size="-1"><xsl:value-of select="LibelleTaxeComplet" /></font></td>
<td bgcolor="EFEFEF"><font face="Tahoma" size="-1"><xsl:value-of select="IdAgent" /></font></td>
<td bgcolor="EFEFEF"><font face="Tahoma" size="-1"><xsl:value-of select="Niveau" /></font></td>
<td bgcolor="EFEFEF"><font face="Tahoma" size="-1"><xsl:value-of select="Base" /></font></td>
  </tr>
</xsl:for-each>
</table>
</center>
</body>
</html>
