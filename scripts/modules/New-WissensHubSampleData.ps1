<#
.SYNOPSIS
    Creates sample knowledge articles with realistic German content.

.DESCRIPTION
    Idempotent: checks if each article page already exists before creating.
    Creates 10 articles across all statuses (Published, Draft, InReview, Archived)
    with proper WH_-prefixed metadata values.
#>

function New-WissensHubSampleData {
    param(
        [Parameter(Mandatory)]
        [PSCustomObject]$Config
    )

    $articles = @(
        # --- Article 1: Passwort-Richtlinie (Published, Mandatory) ---
        @{
            Name     = "Passwort-Richtlinie"
            Title    = "Passwort-Richtlinie"
            Content  = @"
<h2>Zweck und Geltungsbereich</h2>
<p>Diese Richtlinie legt die Mindestanforderungen an Passwoerter fuer alle IT-Systeme der Organisation fest. Sie gilt fuer alle Mitarbeiterinnen und Mitarbeiter, die Zugang zu unternehmensinternen Systemen und Anwendungen haben.</p>

<h2>Anforderungen an Passwoerter</h2>
<ul>
<li>Mindestlaenge: 12 Zeichen</li>
<li>Mindestens ein Grossbuchstabe, ein Kleinbuchstabe, eine Ziffer und ein Sonderzeichen</li>
<li>Keine Wiederverwendung der letzten 10 Passwoerter</li>
<li>Passwoerter duerfen keine persoenlichen Informationen enthalten (Name, Geburtsdatum, etc.)</li>
<li>Maximale Gueltigkeitsdauer: 90 Tage</li>
</ul>

<h3>Multi-Faktor-Authentifizierung (MFA)</h3>
<p>Fuer alle Cloud-Dienste und den VPN-Zugang ist die Nutzung von MFA verpflichtend. Unterstuetzte Methoden sind Microsoft Authenticator App, Hardware-Token und telefonische Verifikation. SMS-basierte Verifikation ist aus Sicherheitsgruenden nicht zulaessig.</p>

<h2>Verantwortlichkeiten</h2>
<p>Jeder Mitarbeiter ist fuer die sichere Aufbewahrung seiner Zugangsdaten verantwortlich. Die Weitergabe von Passwoertern an Dritte ist strengstens untersagt. Bei Verdacht auf Kompromittierung ist das Passwort unverzueglich zu aendern und der IT-Helpdesk zu informieren.</p>
"@
            Values   = @{
                WH_Category     = "IT-Sicherheit"
                WH_Status       = "Published"
                WH_TargetGroups = "Alle Mitarbeiter"
                WH_IsMandatory  = $true
            }
        },

        # --- Article 2: DSGVO-Grundlagen (Published, Mandatory) ---
        @{
            Name     = "DSGVO-Grundlagen"
            Title    = "DSGVO-Grundlagen fuer Mitarbeiter"
            Content  = @"
<h2>Was ist die DSGVO?</h2>
<p>Die Datenschutz-Grundverordnung (DSGVO) ist seit dem 25. Mai 2018 die zentrale Rechtsvorschrift fuer den Datenschutz in der Europaeischen Union. Sie regelt den Umgang mit personenbezogenen Daten und staerkt die Rechte der Betroffenen.</p>

<h2>Grundprinzipien der Datenverarbeitung</h2>
<ul>
<li><strong>Rechtmaessigkeit:</strong> Jede Verarbeitung braucht eine Rechtsgrundlage (z.B. Einwilligung, Vertrag, berechtigtes Interesse)</li>
<li><strong>Zweckbindung:</strong> Daten duerfen nur fuer den festgelegten Zweck verarbeitet werden</li>
<li><strong>Datenminimierung:</strong> Nur die Daten erheben, die tatsaechlich benoetigt werden</li>
<li><strong>Speicherbegrenzung:</strong> Daten nur so lange speichern, wie es der Zweck erfordert</li>
</ul>

<h3>Rechte der Betroffenen</h3>
<p>Betroffene Personen haben das Recht auf Auskunft, Berichtigung, Loeschung, Einschraenkung der Verarbeitung, Datenuebertragbarkeit und Widerspruch. Anfragen von Betroffenen sind unverzueglich an den Datenschutzbeauftragten weiterzuleiten.</p>

<h2>Meldepflicht bei Datenpannen</h2>
<p>Datenschutzverletzungen muessen innerhalb von 72 Stunden der zustaendigen Aufsichtsbehoerde gemeldet werden. Jeder Mitarbeiter, der eine moegliche Datenpanne bemerkt, muss diese sofort dem Datenschutzbeauftragten melden. Beispiele: versehentlicher E-Mail-Versand an falsche Empfaenger, Verlust von Datentraegern, unbefugter Systemzugriff.</p>
"@
            Values   = @{
                WH_Category     = "Datenschutz"
                WH_Status       = "Published"
                WH_TargetGroups = "Alle Mitarbeiter"
                WH_IsMandatory  = $true
            }
        },

        # --- Article 3: Onboarding-Leitfaden (Published, Mandatory) ---
        @{
            Name     = "Onboarding-Leitfaden"
            Title    = "Onboarding-Leitfaden fuer neue Mitarbeiter"
            Content  = @"
<h2>Willkommen im Team</h2>
<p>Dieser Leitfaden begleitet Sie durch Ihre ersten Tage und Wochen im Unternehmen. Er enthaelt alle wichtigen Informationen und Schritte, die Sie fuer einen erfolgreichen Start benoetigen.</p>

<h2>Checkliste fuer den ersten Tag</h2>
<ul>
<li>Personalausweis mitbringen fuer die Erstellung des Mitarbeiterausweises</li>
<li>IT-Ausstattung abholen (Laptop, Headset, Zugangstoken)</li>
<li>Microsoft 365-Konto einrichten und E-Mail-Signatur konfigurieren</li>
<li>VPN-Zugang einrichten (siehe Artikel "VPN-Zugang einrichten")</li>
<li>Pflichtschulungen im Lernportal absolvieren (Datenschutz, IT-Sicherheit, Compliance)</li>
</ul>

<h3>Wichtige Tools und Systeme</h3>
<p>Folgende Anwendungen werden Sie taeglich nutzen: Microsoft Teams fuer die Kommunikation, SharePoint fuer Dokumentenmanagement, das Ticketsystem fuer IT-Anfragen und das Zeiterfassungssystem. Zugangsdaten erhalten Sie von Ihrem Vorgesetzten am ersten Tag.</p>

<h2>Ansprechpartner</h2>
<p>Bei Fragen wenden Sie sich an Ihren direkten Vorgesetzten, Ihren Paten aus dem Team oder den IT-Helpdesk (helpdesk@unternehmen.de, Durchwahl 2222). In den ersten zwei Wochen steht Ihnen Ihr Onboarding-Pate fuer alle Fragen zur Verfuegung.</p>
"@
            Values   = @{
                WH_Category     = "Onboarding"
                WH_Status       = "Published"
                WH_TargetGroups = "Neue Mitarbeiter"
                WH_IsMandatory  = $true
            }
        },

        # --- Article 4: VPN-Zugang einrichten (Published, Not Mandatory) ---
        @{
            Name     = "VPN-Zugang-einrichten"
            Title    = "VPN-Zugang einrichten"
            Content  = @"
<h2>Voraussetzungen</h2>
<p>Fuer die Einrichtung des VPN-Zugangs benoetigen Sie Ihren Firmenlaptop mit installiertem Windows 11 oder macOS, Ihre Microsoft-365-Zugangsdaten sowie die Microsoft Authenticator App auf Ihrem Smartphone.</p>

<h2>Installationsanleitung</h2>
<ul>
<li>Laden Sie den GlobalProtect VPN-Client aus dem Softwarecenter herunter</li>
<li>Installieren Sie die Anwendung und starten Sie sie</li>
<li>Geben Sie als Portal-Adresse <code>vpn.unternehmen.de</code> ein</li>
<li>Authentifizieren Sie sich mit Ihren Microsoft-365-Zugangsdaten</li>
<li>Bestaetigen Sie die MFA-Anfrage in der Microsoft Authenticator App</li>
</ul>

<h3>Fehlerbehebung</h3>
<p>Falls die Verbindung fehlschlaegt, pruefen Sie bitte Ihre Internetverbindung und stellen Sie sicher, dass keine andere VPN-Software aktiv ist. Bei anhaltenden Problemen wenden Sie sich an den IT-Helpdesk unter Angabe der angezeigten Fehlermeldung.</p>

<h2>Sicherheitshinweise</h2>
<p>Der VPN-Zugang darf ausschliesslich fuer dienstliche Zwecke genutzt werden. Trennen Sie die VPN-Verbindung, wenn Sie sie nicht mehr benoetigen. Nutzen Sie den VPN-Zugang nicht ueber oeffentliche, ungesicherte WLAN-Netzwerke ohne zusaetzliche Vorsichtsmassnahmen.</p>
"@
            Values   = @{
                WH_Category     = "IT-Sicherheit"
                WH_Status       = "Published"
                WH_TargetGroups = "IT-Abteilung"
                WH_IsMandatory  = $false
            }
        },

        # --- Article 5: Reisekostenabrechnung (Draft) ---
        @{
            Name     = "Reisekostenabrechnung"
            Title    = "Reisekostenabrechnung"
            Content  = @"
<h2>Geltungsbereich</h2>
<p>Diese Richtlinie regelt die Abrechnung von Reisekosten fuer alle Mitarbeiterinnen und Mitarbeiter. Sie tritt nach Freigabe durch die Geschaeftsfuehrung in Kraft und ersetzt die bisherige Reisekostenordnung.</p>

<h2>Erstattungsfaehige Kosten</h2>
<ul>
<li>Fahrtkosten: Bahn (2. Klasse), Mietwagen, Kilometerpauschale (0,30 EUR/km)</li>
<li>Uebernachtungskosten: Einzelzimmer bis max. 120 EUR/Nacht (Inland)</li>
<li>Verpflegungspauschalen: Abwesenheit ueber 8 Stunden: 14 EUR, ueber 24 Stunden: 28 EUR</li>
<li>Nebenkosten: Parkgebuehren, Maut, oeffentliche Verkehrsmittel am Zielort</li>
</ul>

<h3>Abrechnungsprozess</h3>
<p>Die Reisekostenabrechnung ist innerhalb von 14 Tagen nach Reiseende ueber das digitale Abrechnungssystem einzureichen. Alle Belege sind als Scan oder Foto beizufuegen. Die Genehmigung erfolgt durch den direkten Vorgesetzten.</p>

<h2>Sonderregelungen</h2>
<p>Fuer Auslandsreisen gelten laenderspezifische Pauschalen gemaess den aktuellen BMF-Tabellen. Flugreisen beduerfen einer vorherigen Genehmigung ab einem Ticketpreis von 300 EUR. Business-Class-Buchungen sind nur bei Fluegen ueber 6 Stunden zulaessig.</p>
"@
            Values   = @{
                WH_Category     = "Arbeitsprozesse"
                WH_Status       = "Draft"
                WH_TargetGroups = "Management"
                WH_IsMandatory  = $false
            }
        },

        # --- Article 6: Compliance-Schulung 2026 (Draft) ---
        @{
            Name     = "Compliance-Schulung-2026"
            Title    = "Compliance-Schulung 2026"
            Content  = @"
<h2>Jaehrliche Pflichtschulung</h2>
<p>Die Compliance-Schulung 2026 ist fuer alle Mitarbeiterinnen und Mitarbeiter verpflichtend und muss bis zum 30. Juni 2026 abgeschlossen werden. Die Schulung behandelt aktuelle Themen aus den Bereichen Korruptionspraevention, Kartellrecht und Hinweisgeberschutz.</p>

<h2>Schulungsinhalte</h2>
<ul>
<li>Verhaltenskodex und ethische Grundsaetze des Unternehmens</li>
<li>Korruptionspraevention: Geschenke, Einladungen und Interessenkonflikte</li>
<li>Kartellrechtliche Grundlagen: Verbotene Absprachen und Informationsaustausch</li>
<li>Hinweisgeberschutzgesetz: Meldekanaele und Schutz von Hinweisgebern</li>
</ul>

<h3>Ablauf und Zertifizierung</h3>
<p>Die Schulung besteht aus einem Online-Modul (ca. 45 Minuten) mit abschliessendem Wissenstest. Bei erfolgreicher Teilnahme erhalten Sie ein Zertifikat, das automatisch in Ihrer Personalakte hinterlegt wird. Bei Nichtbestehen kann der Test zweimal wiederholt werden.</p>

<h2>Fristen und Konsequenzen</h2>
<p>Die Schulung muss bis zum 30. Juni 2026 abgeschlossen sein. Vorgesetzte erhalten monatliche Statusberichte ueber den Schulungsfortschritt ihrer Teams. Bei Nichtteilnahme werden die Vorgesetzten und die Personalabteilung informiert.</p>
"@
            Values   = @{
                WH_Category     = "Compliance"
                WH_Status       = "Draft"
                WH_TargetGroups = "Alle Mitarbeiter"
                WH_IsMandatory  = $true
            }
        },

        # --- Article 7: Datensicherung-Konzept (InReview) ---
        @{
            Name     = "Datensicherung-Konzept"
            Title    = "Datensicherung-Konzept"
            Content  = @"
<h2>Zielsetzung</h2>
<p>Dieses Konzept definiert die Strategie und Verfahren zur Datensicherung aller geschaeftskritischen Systeme. Es stellt sicher, dass im Falle eines Datenverlusts eine schnelle Wiederherstellung moeglich ist und die Geschaeftskontinuitaet gewaehrleistet bleibt.</p>

<h2>Backup-Strategie</h2>
<ul>
<li><strong>Taeglich:</strong> Inkrementelle Sicherung aller Datenbankserver und Fileserver (Aufbewahrung: 30 Tage)</li>
<li><strong>Woechentlich:</strong> Vollsicherung aller Systeme jeden Sonntag um 02:00 Uhr (Aufbewahrung: 12 Wochen)</li>
<li><strong>Monatlich:</strong> Vollsicherung mit Auslagerung auf externes Speichermedium (Aufbewahrung: 12 Monate)</li>
<li><strong>Jaehrlich:</strong> Archiv-Backup fuer regulatorische Anforderungen (Aufbewahrung: 10 Jahre)</li>
</ul>

<h3>Wiederherstellungstests</h3>
<p>Vierteljährlich werden Wiederherstellungstests durchgefuehrt, um die Integritaet der Backups zu verifizieren. Die Ergebnisse werden dokumentiert und dem IT-Leiter vorgelegt. Das Recovery Time Objective (RTO) betraegt maximal 4 Stunden, das Recovery Point Objective (RPO) maximal 24 Stunden.</p>

<h2>Verantwortlichkeiten</h2>
<p>Das IT-Operations-Team ist fuer die Durchfuehrung und Ueberwachung der Backups verantwortlich. Fehlgeschlagene Backup-Jobs generieren automatisch ein Ticket im Monitoring-System. Der IT-Sicherheitsbeauftragte prueft die Backup-Berichte monatlich im Rahmen des ISMS.</p>
"@
            Values   = @{
                WH_Category     = "IT-Sicherheit"
                WH_Status       = "InReview"
                WH_TargetGroups = "IT-Abteilung"
                WH_IsMandatory  = $false
            }
        },

        # --- Article 8: Altdaten-Archivierung (Archived) ---
        @{
            Name     = "Altdaten-Archivierung"
            Title    = "Altdaten-Archivierung"
            Content  = @"
<h2>Hintergrund</h2>
<p>Diese Richtlinie wurde im Rahmen der DSGVO-Konformitaetspruefung 2024 erstellt und regelte die Archivierung und Loeschung von Altdaten aus dem vorherigen Dokumentenmanagementsystem. Die Migration wurde im Dezember 2024 abgeschlossen.</p>

<h2>Archivierungsvorgaben</h2>
<ul>
<li>Personenbezogene Daten aelter als 3 Jahre: Pruefen auf Loeschpflicht</li>
<li>Geschaeftsdokumente mit Aufbewahrungspflicht: Uebernahme in das neue Archivsystem</li>
<li>E-Mail-Postfaecher ehemaliger Mitarbeiter: Loeschung nach 6 Monaten (mit Genehmigung)</li>
<li>Projektdokumentationen: Uebernahme in SharePoint mit Metadaten-Mapping</li>
</ul>

<h3>Abgeschlossene Migration</h3>
<p>Die Migration umfasste 450.000 Dokumente aus dem Legacy-System. Davon wurden 120.000 Dokumente gemaess DSGVO-Anforderungen geloescht, 280.000 in das neue System migriert und 50.000 in das Langzeitarchiv ueberfuehrt. Der Abschlussbericht liegt der Geschaeftsfuehrung vor.</p>

<h2>Aktueller Status</h2>
<p>Diese Richtlinie ist archiviert, da die beschriebene Migration abgeschlossen ist. Fuer aktuelle Archivierungsvorgaben beachten Sie bitte die Datenschutzrichtlinie und die IT-Betriebshandbuecher.</p>
"@
            Values   = @{
                WH_Category     = "Datenschutz"
                WH_Status       = "Archived"
                WH_TargetGroups = "Management"
                WH_IsMandatory  = $false
            }
        },

        # --- Article 9: Homeoffice-Regelung (Published, Not Mandatory, flagged as outdated) ---
        @{
            Name     = "Homeoffice-Regelung"
            Title    = "Homeoffice-Regelung"
            Content  = @"
<h2>Geltungsbereich und Rahmenbedingungen</h2>
<p>Diese Regelung gilt fuer alle Mitarbeiterinnen und Mitarbeiter, deren Taetigkeit eine Arbeit von zu Hause aus ermoeglicht. Grundsaetzlich sind bis zu drei Homeoffice-Tage pro Woche moeglich, sofern die Fuehrungskraft zustimmt.</p>
<p><strong>Hinweis: Diese Regelung wird derzeit ueberarbeitet. Eine aktualisierte Version mit den neuen Betriebsvereinbarungen wird voraussichtlich im Q2 2026 veroeffentlicht.</strong></p>

<h2>Technische Voraussetzungen</h2>
<ul>
<li>Firmenlaptop mit VPN-Zugang (siehe "VPN-Zugang einrichten")</li>
<li>Stabile Internetverbindung (mindestens 50 Mbit/s empfohlen)</li>
<li>Separater Arbeitsplatz mit ergonomischer Ausstattung</li>
<li>Microsoft Teams fuer Erreichbarkeit waehrend der Kernarbeitszeit (09:00-15:00 Uhr)</li>
</ul>

<h3>Datenschutz im Homeoffice</h3>
<p>Im Homeoffice gelten dieselben Datenschutzanforderungen wie im Buero. Bildschirme muessen vor unbefugtem Zugriff geschuetzt werden. Vertrauliche Dokumente duerfen nicht ueber private Drucker ausgedruckt werden. Die VPN-Verbindung ist fuer alle dienstlichen Taetigkeiten zu nutzen.</p>

<h2>Arbeitszeit und Erreichbarkeit</h2>
<p>Die regulaere Arbeitszeit und Kernarbeitszeiten gelten auch im Homeoffice. Ueberstunden im Homeoffice beduerfen der vorherigen Genehmigung. Die Zeiterfassung erfolgt ueber das regulaere Zeiterfassungssystem.</p>
"@
            Values   = @{
                WH_Category     = "Arbeitsprozesse"
                WH_Status       = "Published"
                WH_TargetGroups = "Alle Mitarbeiter"
                WH_IsMandatory  = $false
            }
        },

        # --- Article 10: IT-Sicherheitsvorfall-Meldung (Published, Mandatory) ---
        @{
            Name     = "IT-Sicherheitsvorfall-Meldung"
            Title    = "IT-Sicherheitsvorfall-Meldung"
            Content  = @"
<h2>Was ist ein IT-Sicherheitsvorfall?</h2>
<p>Ein IT-Sicherheitsvorfall ist jedes Ereignis, das die Vertraulichkeit, Integritaet oder Verfuegbarkeit von IT-Systemen, Daten oder Netzwerken gefaehrdet. Dazu gehoeren unter anderem Phishing-Angriffe, Schadsoftware-Infektionen, unbefugte Zugriffe und Datenverluste.</p>

<h2>Meldeprozess</h2>
<ul>
<li><strong>Sofort:</strong> Bei Verdacht auf einen Sicherheitsvorfall den betroffenen Rechner vom Netzwerk trennen (LAN-Kabel ziehen, WLAN deaktivieren)</li>
<li><strong>Innerhalb von 15 Minuten:</strong> IT-Helpdesk anrufen (Durchwahl 2222) oder E-Mail an security@unternehmen.de</li>
<li><strong>Innerhalb von 1 Stunde:</strong> Schriftliche Meldung mit Details zum Vorfall (Was ist passiert? Wann? Welche Systeme betroffen?)</li>
<li><strong>Nicht:</strong> Eigenstaendig versuchen, den Vorfall zu beheben, Beweismaterial veraendern oder den Vorfall verheimlichen</li>
</ul>

<h3>Beispiele fuer meldepflichtige Vorfaelle</h3>
<p>Folgende Situationen muessen unverzueglich gemeldet werden: Empfang verdaechtiger E-Mails mit Anhaengen oder Links, unerwartete Passwortzuruecksetzungen, unbekannte Programme auf dem Rechner, ungewoehnliche Systemverlangsamung, verdaechtige Kontobewegungen in Unternehmensanwendungen.</p>

<h2>Konsequenzen bei Nichtmeldung</h2>
<p>Die rechtzeitige Meldung von Sicherheitsvorfaellen ist eine Pflicht jedes Mitarbeiters. Verspaetete oder unterlassene Meldungen koennen die Schadensbewaeltigung erheblich erschweren und arbeitsrechtliche Konsequenzen nach sich ziehen. Bei Fragen wenden Sie sich an den IT-Sicherheitsbeauftragten.</p>
"@
            Values   = @{
                WH_Category     = "IT-Sicherheit"
                WH_Status       = "Published"
                WH_TargetGroups = "Alle Mitarbeiter"
                WH_IsMandatory  = $true
            }
        }
    )

    foreach ($article in $articles) {
        $existingPage = Get-PnPPage -Identity $article.Name -ErrorAction SilentlyContinue
        if ($existingPage) {
            Write-Host "Article '$($article.Name)' already exists. Skipping." -ForegroundColor Yellow
            continue
        }

        Write-Host "Creating article '$($article.Title)'..." -ForegroundColor Cyan

        # Create the page
        Add-PnPPage -Name $article.Name -LayoutType Article -Title $article.Title

        # Add content as text part
        Add-PnPPageTextPart -Page $article.Name -Text $article.Content

        # Get the page list item to set metadata
        $pageItem = Get-PnPListItem -List "SitePages" -Query "<View><Query><Where><Eq><FieldRef Name='FileLeafRef'/><Value Type='Text'>$($article.Name).aspx</Value></Eq></Where></Query></View>"

        if ($pageItem) {
            Set-PnPListItem -List "SitePages" -Identity $pageItem.Id -Values $article.Values
            Write-Host "Article '$($article.Title)' created with metadata." -ForegroundColor Green
        }
        else {
            Write-Host "Article '$($article.Title)' created but could not set metadata (page item not found)." -ForegroundColor Yellow
        }
    }

    Write-Host "Sample data creation complete. $($articles.Count) articles processed." -ForegroundColor Cyan
}
