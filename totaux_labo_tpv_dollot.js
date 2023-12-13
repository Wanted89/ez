var utilisateurs_labo = new Array;
var nom_utilisateurs_labo = new Array;

var url_utilisateurs = "https://eziiitouch.pebix.fr/fiche_monetique/json.php?utilisateurs_tpv=1";
ChargerStyles("style-chargement", ".cat1{background-color:#FF00FF!important;color:#FFF}.cat2{background-color:#3366FF!important;color:#FFF}.cat3{background-color:#008000!important;color:#FFF}table.greyGridTable{border:2px solid #fff;width:100%;text-align:center;border-collapse:collapse}table.greyGridTable td,table.greyGridTable th{border:1px solid #fff;padding:3px 4px}table.greyGridTable tbody td{font-size:12px}table.greyGridTable td{background:#ebebeb}table.greyGridTable thead{background:#fff;border-bottom:4px solid #808080}table.greyGridTable thead th{font-size:15px;font-weight:700;color:#000;text-align:center}table.greyGridTable tfoot{font-size:14px;font-weight:700}.td{color:#fff}tr.moyenne td{background-color:#808080}tr.total td{background-color:#525252}table.greyGridTable tbody td.nb_utilisateur{background-color:#A8A8A8;color:#fff;font-weight:700}.couleur-blanc{color:#FFF}#tempo_div button{margin:5px;font-size:12px;width:53px;background:#464646;color:#fff}#tempo_div button:hover{background:#fff;color:#464646}#tempo_div{display:inline-block;background:#5b5b5b;text-align:center;font-size:12px;font-weight:700}#conteneur_dates{display:block;padding-top:10px;padding-bottom:10px;text-align:center}.categorie_select{font-weight:700;color:#fff;font-size:25px!important;background:#A8A8A8}#conteneur_dates label{margin:5px;font-weight:700}#conteneur_dates button{margin:5px}#outils_auto{padding:5px;border-radius:10px;position:absolute;right:15px;width:320px;height:250px;background:#5b5b5b}.loader{border:16px solid #f3f3f3;border-radius:50%;border-top:16px solid #3498db;width:120px;height:120px;-webkit-animation:spin 2s linear infinite;animation:spin 2s linear infinite;margin-left:auto;margin-right:auto}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0)}100%{-webkit-transform:rotate(360deg)}}@keyframes spin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}.option_script{font-size:20px;color:#000}.option_reference{font-size:10px;color:#777}.option_categorie{color:#A8A8A8;font-size:18px}#chargement_fiches{padding:5px;background:#5b5b5b;color:#fff;border-radius:10px;font-size:10px;width:500px;margin-left:auto;margin-right:auto;margin-top:15px}#resultats_recherche{padding-top:1%;padding-bottom:1%;position:relative;width:95%;border-radius:10px;margin-bottom:5px;margin-top:170px;margin-left:2.5%;margin-right:2.5%;min-height:200px;background:#5b5b5b;color:#fff}.bloc_recherche{display:inline-block;margin:5px;height:30px;line-height:30px;color:#000}");

$.getJSON(url_utilisateurs, function(e) {
	var t = e.values,
		a = 0;
	var i = 0;
	$(t).each(function() {
		if(i++ > 0)
		{
			utilisateurs_labo.push(this[0]);
			nom_utilisateurs_labo.push(this[1]);
		}
	})
	OuvrirStatistiques()
});
	
function roundDecimal(nombre, precision){
    var precision = precision || 2;
    var tmp = Math.pow(10, precision);
    return Math.round( nombre*tmp )/tmp;
}

function ChargerStyles(e, t) {
	if (null == document.getElementById(e)) {
		var a = document.createElement("style");
		a.type = "text/css", a.id = e, a.styleSheet ? a.styleSheet.cssText = t : a.appendChild(document.createTextNode(t)), document.getElementsByTagName("head")[0].appendChild(a)
	}
}

function RecupererDuree(temps) {
	if((temps == "") || (temps.indexOf(" ") == -1) || (temps.indexOf(":") == -1) || (temps.indexOf("j") == -1)) return 0;
	
	temps = temps.slice(1);
	temps = temps.slice(0, temps.length - 1);
	
	var duree_1 = temps.split(' ');
	var duree_2 = duree_1[1].split(':');

	var minutes = parseInt(duree_1[0].substring(0, duree_1[0].indexOf('j')))*3600;
	minutes += parseInt(duree_2[0])*60+parseInt(duree_2[1]);
	
	return minutes;
}

function ChargerFeuilleStyles(e) {
	for (var t = document.styleSheets, a = 0, i = t.length; a < i; a++)
		if (t[a].href == e) return;
	$("head").append("<link rel='stylesheet' type='text/css' href='" + e + "'/>")
}

function ChargerScriptJS(e, t, a) {
	if (null == document.getElementById(t)) {
		var i = document.createElement("script");
		i.type = "text/javascript", i.id = t, i.readyState ? i.onreadystatechange = function() {
			"loaded" !== i.readyState && "complete" !== i.readyState || (i.onreadystatechange = null, a())
		} : i.onload = function() {
			a()
		}, i.src = e, document.getElementsByTagName("head")[0].appendChild(i)
	} else a()
}

function RecupererResultat(debut, fin) {
	$("#resultat_totaux").html("<div class='loader'></div><br><center><h3 style='color:#000'>Récupération des données...</h3></center>");
	
	// Récupération de l'historique
	$.post("https://eziiitouch.pebix.fr/miniregion/labo_history.php?csv=1", {
		date_debut: debut,
		date_fin: fin,
		compte: ""
	}).done(function(resultat) {
		// Traitement du résultat de la requête
		$("#resultat_totaux").html("<div class='loader'></div><br><center><h3 style='color:#000'>Traitement des données...</h3></center>");
		
		// Récupération des index
		lignes = resultat.split("\n");
		const headers = lignes[0].split(";");

		function findIndex(header) {
			return headers.indexOf(header);
		}

		index_utilisateur = findIndex("UTILISATEUR");
		index_champ_temps = findIndex('"TEMPS LABO"');
		index_champ_type = findIndex("ACTION");
		index_champ_type2 = findIndex('"TYPE ORIGINE"');
		index_champ_typemat = findIndex('"TYPE MATERIEL"');

		// Traitement de chaque ligne du résultat
		donnees_csv = new Array;
		for(i = 1; i < lignes.length; i++)
		{
			ligne = lignes[i].split(";");
			if(utilisateurs_labo.indexOf(ligne[index_utilisateur]) > -1)
			{
				// Filtrage des données
				type_traitement = ligne[index_champ_type] === "" ? "Non défini" : ligne[index_champ_type];

				try {
					type_traitement = decodeURIComponent(escape(type_traitement));
				} catch (err) {
					// Gestion des erreurs si nécessaire
				}

				if (type_traitement.includes("Mtce Retour")) {
					type_traitement = "Retour maintenance";
				} else if (type_traitement.includes("SAV")) {
					type_traitement = "Retour SAV";
				} else if (type_traitement.includes("Maintenance Départ")) {
					type_traitement = "Départ maintenance";
				} else if (type_traitement.includes("Retour désinstallation")) {
					type_traitement = "Retour désinstallation";
				} else if (type_traitement.includes("Installation")) {
					type_traitement = "Installation";
				} else {
					switch (ligne[index_champ_type2]) {
						case "DESINSTALLATION":
						case "DEM/REMONTAGE":
							type_traitement = "Retour désinstallation";
							break;
						case "INSTALLATION":
							type_traitement = "Installation";
							break;
						case "DEPLOIEMENT":
							type_traitement = "Déploiement";
							break;
						case "LABO":
						case "MAINTENANCE":
						case "OPE/DIVERSES":
							type_traitement = "Retour maintenance";
							break;
						default:
							// Gestion du cas par défaut si nécessaire
							break;
					}
				}
				
				// Catégorie matériel
				categorie = 3;
				type_mat = ligne[index_champ_typemat].toLowerCase();

				const categoriesMapping = [
					{ key: "pc", value: 1 },
					{ key: "imp", value: 2 },
					{ key: "tir", value: 2 },
					{ key: "balance", value: 2 },
					{ key: "pda", value: 2 },
					{ key: "caisse", value: 1 },
					{ key: "base", value: 1 },
					{ key: "serveur", value: 1 }
				];

				for (const mapping of categoriesMapping) {
					if (type_mat.includes(mapping.key)) {
						categorie = mapping.value;
						break;
					}
				}

				// Si aucun des cas ci-dessus n'est trouvé, la catégorie reste 3 par défaut
				
				// Enregistrement des données des utilisateurs qui nous intéressent
				donnees_csv.push(ligne[index_utilisateur]+"{}"+type_traitement+"{}"+ligne[index_champ_temps]+"{}"+categorie);
			}
		}
		
		var techs = new Array;
		var durees = new Array;
		var utilisateurs_ez = new Array;
		var entetes = new Array;
		var total_util_arr = new Array;
		var total_duree = 0;

		// Traitement des données du fichier CSV
		donnees_csv.forEach(function(donnee) {
			valeurs = donnee.split("{}");
			
			// Initialisation categories
			if (valeurs[0]+":"+valeurs[1]+":categorie1" in techs === false) techs[valeurs[0]+":"+valeurs[1]+":categorie1"] = 0;
			if (valeurs[0]+":"+valeurs[1]+":categorie2" in techs === false) techs[valeurs[0]+":"+valeurs[1]+":categorie2"] = 0;
			if (valeurs[0]+":"+valeurs[1]+":categorie3" in techs === false) techs[valeurs[0]+":"+valeurs[1]+":categorie3"] = 0;
			
			if(valeurs[3] == 1) valeurs[0]+":"+valeurs[1]+":categorie1" in techs ? techs[valeurs[0]+":"+valeurs[1]+":categorie1"]++ : techs[valeurs[0]+":"+valeurs[1]+":categorie1"] = 1;
			else if(valeurs[3] == 2) valeurs[0]+":"+valeurs[1]+":categorie2" in techs ? techs[valeurs[0]+":"+valeurs[1]+":categorie2"]++ : techs[valeurs[0]+":"+valeurs[1]+":categorie2"] = 1;
			else if(valeurs[3] == 3) valeurs[0]+":"+valeurs[1]+":categorie3" in techs ? techs[valeurs[0]+":"+valeurs[1]+":categorie3"]++ : techs[valeurs[0]+":"+valeurs[1]+":categorie3"] = 1;
			
			valeurs[0]+":"+valeurs[1] in techs ? techs[valeurs[0]+":"+valeurs[1]]++ : techs[valeurs[0]+":"+valeurs[1]] = 1;
			valeurs[0] in durees ? durees[valeurs[0]] += RecupererDuree(valeurs[2]) : durees[valeurs[0]] = RecupererDuree(valeurs[2]);
			
			if(entetes.indexOf(valeurs[1]) == -1) entetes.push(valeurs[1]);
			if(utilisateurs_ez.indexOf(valeurs[0]) == -1) utilisateurs_ez.push(valeurs[0]);
		});
		

		// Création de la table
		table_html = '<table id="resultats_stats" class="greyGridTable">';
				
				// Entête
				table_html += '<thead><tr>';
					table_html += '<th></th>';
					// table_html += '<th>Identifiant</th>';
					entetes.forEach(function(entete) {
						table_html += '<th colspan="3">'+entete.split('"').join('')+'</th>';
					});
					table_html += '<th>Durée</th>';
					table_html += '<th>Total</th>';
				table_html += '</tr></thead>';
				
				// Corps
				table_html += '<tbody>';
					utilisateurs_ez.forEach(function(uti) {
						table_html += '<tr class="ligne-utilisateur">';
							table_html += '<td style="font-size: 17px;"><b>'+nom_utilisateurs_labo[utilisateurs_labo.indexOf(uti)]+'</b></td>';
							// table_html += '<td style="position:relative;font-size: 15px;"><b>'+uti+'</b></td>';
							total_util = 0;
							total_cat1 = 0;
							total_cat2 = 0;
							total_cat3 = 0;
							
							entetes.forEach(function(entete) {
								if(uti+":"+entete in techs)
								{
									total_util += techs[uti+":"+entete];
									total_cat1 += techs[uti+":"+entete+":categorie1"];
									total_cat2 += techs[uti+":"+entete+":categorie2"];
									total_cat3 += techs[uti+":"+entete+":categorie3"];
									
									table_html += '<td colspan="3"><table style="width:100%"><tr><td class="cat1" style="font-weight:bold">'+techs[uti+":"+entete+":categorie1"]+'</td><td class="cat2" style="font-weight:bold">'+techs[uti+":"+entete+":categorie2"]+'</td><td class="cat3" style="font-weight:bold">'+techs[uti+":"+entete+":categorie3"]+'</td></tr><tr><td colspan="3" style="font-size: 18px;font-weight:bold;background-color:#808080;color:#FFF">'+techs[uti+":"+entete]+'</td></tr></table></td>';
								}
								else table_html += '<td colspan="3" style="font-size: 15px;color:#CECECE">0</td>';
							});
							total_duree += durees[uti];
							table_html += '<td style="font-size: 18px;"><b>'+ConvertirDuree(durees[uti])+'</b></td>';
							table_html += '<td style="font-size: 18px;font-weight:bold"><table style="width:100%"><tr><td class="cat1" style="font-weight:bold">'+total_cat1+'</td><td class="cat2" style="font-weight:bold">'+total_cat2+'</td><td class="cat3" style="font-weight:bold">'+total_cat3+'</td></tr><tr><td colspan="3" class="total-utilisateur" style="font-size: 25px;font-weight:bold;background-color:#808080;color:#FFF">'+total_util+'</td></tr></table></td>';
						table_html += '</tr>';
						total_util_arr.push(total_util);
					});
				table_html += '</tbody>';
				
				// Pied
				table_html += '<tfoot>';
				
				table_html += '<tr class="moyenne"><td class="couleur-blanc">MOYENNE</td>';
					total = 0;
					total_cat1 = 0;
					total_cat2 = 0;
					total_cat3 = 0;
					total_moyen = 0;
					total_moyen_cat1 = 0;
					total_moyen_cat2 = 0;
					total_moyen_cat3 = 0;
					temps_moyen = 0;
					
					entetes.forEach(function(entete) {
						total_ent = 0;
						total_ent_cat1 = 0;
						total_ent_cat2 = 0;
						total_ent_cat3 = 0;
						
						for (var uti_lab in utilisateurs_labo) {
							utilisateur_actuel = utilisateurs_labo[uti_lab];
							if(techs[utilisateur_actuel+":"+entete])
							{
								total_ent_cat1 += techs[utilisateur_actuel+":"+entete+":categorie1"];
								total_ent_cat2 += techs[utilisateur_actuel+":"+entete+":categorie2"];
								total_ent_cat3 += techs[utilisateur_actuel+":"+entete+":categorie3"];
								total_ent += techs[utilisateur_actuel+":"+entete+":categorie1"]+techs[utilisateur_actuel+":"+entete+":categorie2"]+techs[utilisateur_actuel+":"+entete+":categorie3"];
							}
						}
						
						total_cat1 += total_ent_cat1;
						total_cat2 += total_ent_cat2;
						total_cat3 += total_ent_cat3;
						total += total_ent;
						
						entete_moyen = roundDecimal(total_ent/utilisateurs_ez.length, 2);
						entete_moyen_cat1 = roundDecimal(total_ent_cat1/utilisateurs_ez.length, 2);
						entete_moyen_cat2 = roundDecimal(total_ent_cat2/utilisateurs_ez.length, 2);
						entete_moyen_cat3 = roundDecimal(total_ent_cat3/utilisateurs_ez.length, 2);
						
						temps_moyen = Math.round(total_duree/utilisateurs_ez.length);
						
						total_moyen = roundDecimal(total/utilisateurs_ez.length, 2);
						total_moyen_cat1 = roundDecimal(total_cat1/utilisateurs_ez.length, 2);
						total_moyen_cat2 = roundDecimal(total_cat2/utilisateurs_ez.length, 2);
						total_moyen_cat3 = roundDecimal(total_cat3/utilisateurs_ez.length, 2);
						
						table_html += '<td colspan="3" style="font-size: 18px;"><table style="width:100%"><tr><td class="cat1" style="font-weight:bold">'+entete_moyen_cat1+'</td><td class="cat2" style="font-weight:bold">'+entete_moyen_cat2+'</td><td class="cat3" style="font-weight:bold">'+entete_moyen_cat3+'</td></tr><tr><td colspan="3" class="total-utilisateur couleur-blanc" style="font-size: 25px;font-weight:bold;background-color:#808080;color:#FFF">'+entete_moyen+'</td></tr></table></td>';
					});
					
					table_html += '<td class="couleur-blanc" style="font-size: 25px;"><b>'+ConvertirDuree(temps_moyen)+'</b></td>';
					table_html += '<td style="font-size: 25px;"><table style="width:100%"><tr><td class="cat1" style="font-weight:bold">'+total_moyen_cat1+'</td><td class="cat2" style="font-weight:bold">'+total_moyen_cat2+'</td><td class="cat3" style="font-weight:bold">'+total_moyen_cat3+'</td></tr><tr><td colspan="3" class="total-utilisateur couleur-blanc" style="font-size: 25px;font-weight:bold;background-color:#808080;color:#FFF">'+total_moyen+'</td></tr></table></td>';
				

				table_html += '</tr>';
				
				table_html += '<tr class="total"><td class="couleur-blanc">TOTAL</td>';
					total = 0;
					total_cat1 = 0;
					total_cat2 = 0;
					total_cat3 = 0;
					
					entetes.forEach(function(entete) {
						total_ent = 0;
						total_ent_cat1 = 0;
						total_ent_cat2 = 0;
						total_ent_cat3 = 0;
						
						for (var uti_lab in utilisateurs_labo) {
							utilisateur_actuel = utilisateurs_labo[uti_lab];
							if(techs[utilisateur_actuel+":"+entete])
							{
								total_ent_cat1 += techs[utilisateur_actuel+":"+entete+":categorie1"];
								total_ent_cat2 += techs[utilisateur_actuel+":"+entete+":categorie2"];
								total_ent_cat3 += techs[utilisateur_actuel+":"+entete+":categorie3"];
								total_ent += techs[utilisateur_actuel+":"+entete+":categorie1"]+techs[utilisateur_actuel+":"+entete+":categorie2"]+techs[utilisateur_actuel+":"+entete+":categorie3"];
							}
						}
						
						total_cat1 += total_ent_cat1;
						total_cat2 += total_ent_cat2;
						total_cat3 += total_ent_cat3;
						total += total_ent;
						
						table_html += '<td colspan="3" style="font-size: 25px;font-weight:bold"><table style="width:100%"><tr><td class="cat1" style="font-weight:bold">'+total_ent_cat1+'</td><td class="cat2" style="font-weight:bold">'+total_ent_cat2+'</td><td class="cat3" style="font-weight:bold">'+total_ent_cat3+'</td></tr><tr><td colspan="3" class="total-utilisateur couleur-blanc" style="font-size: 25px;font-weight:bold;background-color:#525252;color:#FFF">'+total_ent+'</td></tr></table></td>';
					});
					
					table_html += '<td class="couleur-blanc" style="font-size: 25px;"><b>'+ConvertirDuree(total_duree)+'</b></td>';
					table_html += '<td style="font-size: 25px;"><table style="width:100%"><tr><td class="cat1" style="font-weight:bold">'+total_cat1+'</td><td class="cat2" style="font-weight:bold">'+total_cat2+'</td><td class="cat3" style="font-weight:bold">'+total_cat3+'</td></tr><tr><td colspan="3" class="total-utilisateur couleur-blanc" style="font-size: 25px;font-weight:bold;background-color:#525252;color:#FFF">'+total+'</td></tr></table></td>';
				

				table_html += '</tr>';
				table_html += '</tfoot>';
				
		// Fermeture de la table
		table_html += '</table>';
		table_html += '<br><div style="text-align:center"><span class="cat1" style="font-weight:bold; font-size:14px;margin-right:25px;padding:5px;">Catégorie I : Traitement du matériel long</span>';
		table_html += '<span class="cat2" style="font-weight:bold; font-size:14px;margin-right:25px;padding:5px;">Catégorie II : Traitement du matériel moyen</span>';
		table_html += '<span class="cat3" style="font-weight:bold; font-size:14px;padding:5px;">Catégorie III : Traitement du matériel rapide</span></div>';
		table_html += '<br><div class="chart-container" style="margin-left:auto;margin-right:auto;;position: relative; height:380px; width:100%;"><canvas id="myChart"></canvas></div>';
		
		$("#resultat_totaux").html(table_html);
		
		var barChartData = {
			labels: utilisateurs_ez,
			datasets: [{
				label: 'Pièces traitées',
            backgroundColor: [
                'rgba(51, 153, 102, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 205, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 0, 0, 1)'
            ],
				data: total_util_arr
			}]

		};

		var ctx = document.getElementById('myChart').getContext('2d');
		window.myBar = new Chart(ctx, {
			type: 'pie',
			data: barChartData,
			options: {
				responsive: true,
				maintainAspectRatio : false,
			}
		});
		for (var id in Chart.instances) {
			Chart.instances[id].resize();
		}
		TrierTable();
	})
}

function RecupererJourPrecedent() {
    let d = new Date();
    let day = d.getDay();

    if (day === 1) { // Lundi
        // Revenir au vendredi précédent
        d.setDate(d.getDate() - 3);
    } else if (day === 0) { // Dimanche
        // Revenir au vendredi
        d.setDate(d.getDate() - 2);
    } else {
        // Revenir au jour précédent
        d.setDate(d.getDate() - 1);
    }

    return d;
}

function RecupererLundi() {
	d = new Date();
	var day = d.getDay(),
	diff = d.getDate() - day + (day == 0 ? -6:1);
	return new Date(d.setDate(diff));
}

function RecupererDimanche() {
	d = new Date();
	var day = d.getDay(),
	diff = d.getDate() - day + (day == 0 ? 0:7);
	return new Date(d.setDate(diff));
}

function ConvertirDuree(minutes) {
	var heures = Math.trunc(minutes / 60);
	var minutes = Math.round(((minutes / 60)-heures)*60);
	
	if (heures < 10) heures = "0"+heures;
	if (minutes < 10) minutes = "0"+minutes;
	
	return heures + "h" + minutes;
}

function TrierTable() {
    // Récupération des lignes de la table
    var lignesUtilisateur = Array.from($(".ligne-utilisateur"));

    // Tri des lignes en fonction de la valeur numérique
    lignesUtilisateur.sort(function(a, b) {
        var valeurA = Number($(a).find(".total-utilisateur").text());
        var valeurB = Number($(b).find(".total-utilisateur").text());
        return valeurB - valeurA; // Tri décroissant
    });

    // Réorganisation des lignes dans la table
    var table = $("#resultats_stats");
    lignesUtilisateur.forEach(function(ligne) {
        table.append(ligne);
    });
}

function OuvrirStatistiques() {
	$("#stats_icon").removeClass("fa-list-alt");
	$("#stats_icon").addClass("fa-spinner fa-pulse");
	
	// Suppression de la fenêtre si déjà ouverte
	$("#dialog_stats") && $("#dialog_stats").remove();
	
	// Ouverture de la fenêtre
	ChargerFeuilleStyles("https://eziiitouch.pebix.fr/fiche_monetique/jquery-ui-1.12.1/jquery-ui.min.css");
	
	var dialog_width = $(window).width()-($(window).width()*(5/100));
	var dialog_height = $(window).height()-($(window).height()*(5/100));
	
	ChargerScriptJS("https://eziiitouch.pebix.fr/fiche_monetique/js/Chart.min.js", "chart_js", function() {ChargerScriptJS("https://eziiitouch.pebix.fr/fiche_monetique/jquery-ui-1.12.1/jquery-ui.min.js", "jquery_ui", function() {
		dialog = $("<div id='dialog_stats'></div>").dialog({
			modal: !0,
			width: dialog_width,
			height: dialog_height,
			left: '0px',
			top:'0px',
			show: {
				effect: "scale",
				duration: 250
			},
			hide: {
				effect: "scale",
				duration: 250
			},
			title: "Statistiques - Laboratoire TPV - Fouchères",
			close: function() {
				$("#dialog_stats").remove();
			},
			open: function() {
				$("#stats_icon").removeClass("fa-spinner fa-pulse");
				$("#stats_icon").addClass("fa-list-alt");
				$(".ui-widget-overlay").css({
					opacity: .8,
					filter: "Alpha(Opacity=100)",
					backgroundColor: "black"
				});
				
				$(this).html('<div id="conteneur_dates"><label>Date début : <input type="text" id="datepicker-totaux" tabindex="-1"></label><label>Date fin : <input type="text" id="datepicker-totaux-2" tabindex="-1"></label><button id="valider_dates" type="button" class="ui-button ui-corner-all ui-widget">Valider</button></div><span id="resultat_totaux" style="display:block;border-top:1px solid #ddd;padding-top:10px;"></span></div>');

				$("#valider_dates").click(function() {
					date_debut=$("#datepicker-totaux").val();
					date_fin=$("#datepicker-totaux-2").val();
					
					""==date_debut||""==date_fin?alert("Veuillez remplir les deux champs!"):RecupererResultat(date_debut,date_fin);
				});
				
				$("#datepicker-totaux").datepicker({
					autoSize: !0,
					maxDate: "today",
					altField: "#datepicker-totaux",
					closeText: "Fermer",
					prevText: "Précédent",
					nextText: "Suivant",
					firstDay: 1,
					currentText: "Aujourd'hui",
					monthNames: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"],
					monthNamesShort: ["Janv.", "Févr.", "Mars", "Avril", "Mai", "Juin", "Juil.", "Aout", "Sept.", "Oct.", "Nov.", "Déc."],
					dayNames: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
					dayNamesShort: ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."],
					dayNamesMin: ["D", "L", "M", "M", "J", "V", "S"],
					weekHeader: "Sem.",
					dateFormat: "dd/mm/yy",
					onSelect: function(e) {
						$("#datepicker-totaux-2").datepicker("option", "minDate", e)
					}
				}), $("#datepicker-totaux-2").datepicker({
					autoSize: !0,
					maxDate: "today",
					altField: "#datepicker-totaux-2",
					closeText: "Fermer",
					prevText: "Précédent",
					nextText: "Suivant",
					firstDay: 1,
					currentText: "Aujourd'hui",
					monthNames: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Décembre"],
					monthNamesShort: ["Janv.", "Févr.", "Mars", "Avril", "Mai", "Juin", "Juil.", "Aout", "Sept.", "Oct.", "Nov.", "Déc."],
					dayNames: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
					dayNamesShort: ["Dim.", "Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam."],
					dayNamesMin: ["D", "L", "M", "M", "J", "V", "S"],
					weekHeader: "Sem.",
					dateFormat: "dd/mm/yy",
					onSelect: function(e) {
						$("#datepicker-totaux").datepicker("option", "maxDate", e)
					}
				});
				var e = new Date,
					t = e.getDate(),
					a = e.getMonth() + 1;
				t < 10 && (t = "0" + t), a < 10 && (a = "0" + a);
				var i = t + "/" + a + "/" + e.getFullYear();
				
				$("#datepicker-totaux").val(i);
				$("#datepicker-totaux-2").val(i);
				date_debut = $("#datepicker-totaux").val();
				date_fin = $("#datepicker-totaux-2").val();
				RecupererResultat(date_debut, date_fin);
			},
			buttons: {
				"Jour précédent": function() {
					var e = RecupererJourPrecedent(),
						t = e.getDate(),
						a = e.getMonth() + 1;
					t < 10 && (t = "0" + t), a < 10 && (a = "0" + a);
					var i = t + "/" + a + "/" + e.getFullYear();
					
					$("#datepicker-totaux").val(i);
					$("#datepicker-totaux-2").val(i);
					date_debut = $("#datepicker-totaux").val();
					date_fin = $("#datepicker-totaux-2").val();
					RecupererResultat(date_debut, date_fin);
				},
				"Aujourd'hui": function() {
					var e = new Date,
					t = e.getDate(),
					a = e.getMonth() + 1;
					t < 10 && (t = "0" + t), a < 10 && (a = "0" + a);
					var i = t + "/" + a + "/" + e.getFullYear();
					
					$("#datepicker-totaux").val(i);
					$("#datepicker-totaux-2").val(i);
					date_debut = $("#datepicker-totaux").val();
					date_fin = $("#datepicker-totaux-2").val();
					RecupererResultat(date_debut, date_fin);
				},
				"Semaine en cours": function() {
					var lundi_date = RecupererLundi();
					var dimanche_date = RecupererDimanche();
					
					var l_jour = lundi_date.getDate();
					var l_mois = lundi_date.getMonth() + 1;
					var l_annee = lundi_date.getFullYear();
					
					var d_jour = dimanche_date.getDate();
					var d_mois = dimanche_date.getMonth() + 1;
					var d_annee = dimanche_date.getFullYear();
					
					l_jour < 10 && (l_jour = "0" + l_jour);
					l_mois < 10 && (l_mois = "0" + l_mois);
					
					d_jour < 10 && (d_jour = "0" + d_jour);
					d_mois < 10 && (d_mois = "0" + d_mois);
					
					var lundi = l_jour + "/" + l_mois + "/" + l_annee;
					var dimanche = d_jour + "/" + d_mois + "/" + d_annee;
					
					$("#datepicker-totaux").val(lundi);
					$("#datepicker-totaux-2").val(dimanche);
					
					RecupererResultat(lundi, dimanche);
				},
				"Mois en cours": function() {
					var e = new Date();
					e = new Date(e.getFullYear(), e.getMonth(), 1);
					t = e.getDate(),
					a = e.getMonth() + 1;
					t < 10 && (t = "0" + t), a < 10 && (a = "0" + a);
					var i = t + "/" + a + "/" + e.getFullYear();
					
					$("#datepicker-totaux").val(i);
					var e = new Date();
					e = new Date(e.getFullYear(), e.getMonth() + 1, 0);
					t = e.getDate(),
					a = e.getMonth() + 1;
					t < 10 && (t = "0" + t), a < 10 && (a = "0" + a);
					var i = t + "/" + a + "/" + e.getFullYear();
					
					$("#datepicker-totaux-2").val(i);
					date_debut = $("#datepicker-totaux").val();
					date_fin = $("#datepicker-totaux-2").val();
					RecupererResultat(date_debut, date_fin);
				}
			}
		})
	})});
}
